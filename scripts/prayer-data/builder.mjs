import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { AwqatSalahClient, findSingleSwedenState, findSwedenCountry } from './awqat-salah-client.mjs';
import { DEFAULT_SOURCE_CACHE_DIR, JsonFileCache } from './file-cache.mjs';
import { NominatimClient } from './nominatim-client.mjs';
import {
  normalizeAwqatCity,
  normalizeNominatimLocation,
  pickBestNominatimResult,
} from './normalization.mjs';

export const SCHEMA_VERSION = 1;
export const DEFAULT_OUTPUT_DIR = 'features/schedule/data/prayer-data';

export async function buildPrayerData(options) {
  const year = options.year;
  const outputDir = options.outputDir ?? DEFAULT_OUTPUT_DIR;
  const sourceCache = new JsonFileCache({
    dir: options.cacheDir ?? DEFAULT_SOURCE_CACHE_DIR,
    enabled: options.cache !== false,
    refresh: options.refreshCache === true,
  });

  const awqatClient =
    options.awqatClient ??
    new AwqatSalahClient({
      baseUrl: process.env.AWQAT_BASE_URL,
      username: process.env.AWQAT_USERNAME,
      password: process.env.AWQAT_PASSWORD,
    });
  const locationClient = options.locationClient ?? new NominatimClient();

  const countries = await sourceCache.getOrSet(['awqat', 'countries'], () => awqatClient.getCountries());
  const swedenCountry = findSwedenCountry(countries);
  const states = await sourceCache.getOrSet(['awqat', 'states', swedenCountry.id], () =>
    awqatClient.getStates(swedenCountry.id),
  );
  const swedenState = findSingleSwedenState(states);
  const awqatCities = (
    await sourceCache.getOrSet(['awqat', 'cities', swedenState.id], () => awqatClient.getCities(swedenState.id))
  ).map(normalizeAwqatCity);

  const locationResult = await resolveLocations({
    awqatCities,
    locationClient,
    sourceCache,
  });

  logUnresolvedLocations(locationResult.unresolved);

  const cityPayload = buildCityPayload({ locations: locationResult.locations });

  const schedules = [];
  const locationByAwqatId = new Map(locationResult.locations.map((entry) => [entry.awqatCity.id, entry.location]));
  const selectedAwqatCities = options.cityId
    ? awqatCities.filter((city) => city.id === Number(options.cityId))
    : awqatCities;

  if (options.cityId && selectedAwqatCities.length === 0) {
    throw new Error(`Awqat city id ${options.cityId} was not found in Sweden cities.`);
  }

  for (const awqatCity of selectedAwqatCities) {
    const location = locationByAwqatId.get(awqatCity.id);

    if (!location) {
      continue;
    }

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const rows = await sourceCache.getOrSet(['awqat', 'date-range', awqatCity.id, startDate, endDate], () =>
      awqatClient.getDateRange({
        cityId: awqatCity.id,
        startDate,
        endDate,
      }),
    );
    schedules.push(buildSchedulePayload({ year, awqatCity, location, rows, includeSourceRaw: options.includeSourceRaw }));
  }

  const manifest = buildManifest({
    year,
    cityPayload,
    schedules,
    sources: {
      awqatCountry: swedenCountry,
      awqatState: swedenState,
      awqatCityCount: awqatCities.length,
      nominatimResolvedCount: locationResult.locations.length,
      nominatimUnresolvedCount: locationResult.unresolved.length,
    },
  });

  await writeOutputs({ outputDir, cityPayload, schedules, manifest });

  return {
    outputDir,
    cities: cityPayload,
    schedules,
    manifest,
    sourceCacheDir: sourceCache.enabled ? sourceCache.dir : null,
  };
}

export function buildCityPayload({ locations }) {
  return locations.map((entry) => entry.location);
}

export function buildSchedulePayload({ year, awqatCity, location, rows, includeSourceRaw = false }) {
  const days = rows.map((row) => normalizePrayerRow(row));

  return {
    schemaVersion: SCHEMA_VERSION,
    year,
    generatedAt: new Date().toISOString(),
    city: {
      awqatCityId: awqatCity.id,
      ...location,
    },
    source: {
      provider: 'Awqat Salah / Diyanet',
      timezone: 'Europe/Stockholm',
      greenwichMeanTimeZoneValues: Array.from(
        new Set(days.map((day) => day.source.greenwichMeanTimeZone).filter((value) => value !== null)),
      ).sort(),
    },
    days,
    ...(includeSourceRaw ? { sourceRows: rows } : {}),
  };
}

export function normalizePrayerRow(row) {
  return {
    date: normalizeAwqatDate(row.gregorianDateLongIso8601, row.gregorianDateShortIso8601),
    prayers: {
      fajr: row.fajr,
      sunrise: row.sunrise,
      dhuhr: row.dhuhr,
      asr: row.asr,
      maghrib: row.maghrib,
      isha: row.isha,
    },
    qiblaTime: row.qiblaTime ?? null,
    hijri: {
      short: row.hijriDateShort ?? null,
      long: row.hijriDateLong ?? null,
      shortIso8601: row.hijriDateShortIso8601 ?? null,
      longIso8601: row.hijriDateLongIso8601 ?? null,
    },
    source: {
      greenwichMeanTimeZone: row.greenwichMeanTimeZone ?? null,
      gregorianDateShort: row.gregorianDateShort ?? null,
      gregorianDateShortIso8601: row.gregorianDateShortIso8601 ?? null,
      gregorianDateLong: row.gregorianDateLong ?? null,
      gregorianDateLongIso8601: row.gregorianDateLongIso8601 ?? null,
      astronomicalSunrise: row.astronomicalSunrise ?? null,
      astronomicalSunset: row.astronomicalSunset ?? null,
      shapeMoonUrl: row.shapeMoonUrl ?? null,
    },
  };
}

export function buildManifest({ year, cityPayload, schedules, sources }) {
  const cityChecksum = checksumJson(cityPayload);
  const scheduleChecksums = Object.fromEntries(
    schedules.map((schedule) => [String(schedule.city.awqatCityId), checksumJson(schedule)]),
  );

  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    years: [year],
    source: sources,
    counts: {
      locations: cityPayload.length,
      schedules: schedules.length,
      unresolved: sources.nominatimUnresolvedCount,
    },
    checksums: {
      locations: cityChecksum,
      schedules: scheduleChecksums,
    },
  };
}

async function resolveLocations({ awqatCities, locationClient, sourceCache }) {
  const locations = [];
  const unresolved = [];

  for (const awqatCity of awqatCities) {
    const results = await sourceCache.getOrSet(['nominatim', 'search', awqatCity.normalizedName], () =>
      locationClient.searchSwedishLocation(awqatCity.normalizedName),
    );
    const result = pickBestNominatimResult(results);

    if (!result) {
      unresolved.push({ awqatCity, reason: 'Nominatim returned no usable result.' });
      continue;
    }

    locations.push({
      awqatCity,
      location: normalizeNominatimLocation({ awqatCity, result }),
    });
  }

  return { locations, unresolved };
}

function logUnresolvedLocations(unresolved) {
  if (unresolved.length === 0) {
    return;
  }

  console.warn(`Nominatim could not resolve ${unresolved.length} Awqat cities. They will be skipped.`);
  for (const item of unresolved) {
    console.warn(`- ${item.awqatCity.code}: ${item.reason}`);
  }
}

function normalizeAwqatDate(longIso, shortIso) {
  if (typeof longIso === 'string' && longIso.length >= 10) {
    return longIso.slice(0, 10);
  }

  if (typeof shortIso === 'string') {
    const match = shortIso.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }

  throw new Error(`Could not normalize Awqat date from ${longIso ?? shortIso ?? 'empty value'}.`);
}

async function writeOutputs({ outputDir, cityPayload, schedules, manifest }) {
  await mkdir(path.join(outputDir, 'years'), { recursive: true });
  await writeJson(path.join(outputDir, 'cities.json'), cityPayload);
  await writeJson(path.join(outputDir, 'manifest.json'), manifest);

  for (const schedule of schedules) {
    await writeJson(
      path.join(outputDir, 'years', String(schedule.year), 'cities', `${schedule.city.awqatCityId}.json`),
      schedule,
    );
  }
}

async function writeJson(filePath, payload) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function checksumJson(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
