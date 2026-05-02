import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildPrayerData, normalizePrayerRow } from './builder.mjs';

test('normalizes Awqat prayer rows into compact app-owned records', () => {
  assert.deepEqual(
    normalizePrayerRow({
      fajr: '06:25',
      sunrise: '08:48',
      dhuhr: '12:20',
      asr: '13:28',
      maghrib: '15:42',
      isha: '17:50',
      qiblaTime: '09:14',
      hijriDateShort: '12.7.1447',
      hijriDateLong: '12 Recep 1447',
      gregorianDateShort: '01.01.2026',
      gregorianDateShortIso8601: '01.01.2026',
      gregorianDateLong: '01 Ocak 2026 Perşembe',
      gregorianDateLongIso8601: '2026-01-01T00:00:00.0000000+03:00',
      greenwichMeanTimeZone: 1,
    }),
    {
      date: '2026-01-01',
      prayers: {
        fajr: '06:25',
        sunrise: '08:48',
        dhuhr: '12:20',
        asr: '13:28',
        maghrib: '15:42',
        isha: '17:50',
      },
      qiblaTime: '09:14',
      hijri: {
        short: '12.7.1447',
        long: '12 Recep 1447',
        shortIso8601: null,
        longIso8601: null,
      },
      source: {
        greenwichMeanTimeZone: 1,
        gregorianDateShort: '01.01.2026',
        gregorianDateShortIso8601: '01.01.2026',
        gregorianDateLong: '01 Ocak 2026 Perşembe',
        gregorianDateLongIso8601: '2026-01-01T00:00:00.0000000+03:00',
        astronomicalSunrise: null,
        astronomicalSunset: null,
        shapeMoonUrl: null,
      },
    },
  );
});

test('builds storage-neutral output with mocked source clients', async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), 'sakinah-prayer-data-'));

  try {
    const result = await buildPrayerData({
      year: 2026,
      cache: false,
      outputDir,
      awqatClient: new MockAwqatClient(),
      locationClient: new MockNominatimClient(),
    });

    assert.equal(result.cities.length, 1);
    assert.deepEqual(result.cities[0], {
      awqatCityId: 14320,
      awqatName: 'GOTEBORG',
      displayName: 'Göteborg',
      type: 'city',
      lat: 57.70716,
      lng: 11.96679,
      source: 'osm',
    });
    assert.equal(result.schedules.length, 1);
    assert.equal(result.schedules[0].days.length, 1);
    assert.equal(result.manifest.counts.locations, 1);

    const manifest = JSON.parse(await readFile(path.join(outputDir, 'manifest.json'), 'utf8'));
    const citySchedule = JSON.parse(
      await readFile(path.join(outputDir, 'years', '2026', 'cities', '14320.json'), 'utf8'),
    );

    assert.equal(manifest.years[0], 2026);
    assert.equal(citySchedule.city.awqatCityId, 14320);
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

class MockAwqatClient {
  async getCountries() {
    return [{ id: 12, code: 'SWEDEN', name: 'ISVEC' }];
  }

  async getStates() {
    return [{ id: 731, code: 'SWEDEN', name: 'ISVEC' }];
  }

  async getCities() {
    return [{ id: 14320, code: 'GOTEBORG', name: 'GOTEBORG' }];
  }

  async getDateRange() {
    return [
      {
        fajr: '06:25',
        sunrise: '08:48',
        dhuhr: '12:20',
        asr: '13:28',
        maghrib: '15:42',
        isha: '17:50',
        qiblaTime: '09:14',
        gregorianDateShortIso8601: '01.01.2026',
        gregorianDateLongIso8601: '2026-01-01T00:00:00.0000000+03:00',
        greenwichMeanTimeZone: 1,
      },
    ];
  }
}

class MockNominatimClient {
  async searchSwedishLocation() {
    return [
      {
        category: 'place',
        type: 'city',
        lat: '57.70716',
        lon: '11.96679',
        importance: 0.7,
        name: 'Göteborg',
        namedetails: {
          name: 'Göteborg',
        },
      },
    ];
  }
}
