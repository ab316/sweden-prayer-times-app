#!/usr/bin/env node

import { buildPrayerData, DEFAULT_OUTPUT_DIR } from './prayer-data/builder.mjs';
import { DEFAULT_SOURCE_CACHE_DIR } from './prayer-data/file-cache.mjs';

function parseArgs(argv) {
  const args = {
    cityId: null,
    cache: true,
    cacheDir: process.env.PRAYER_DATA_CACHE_DIR ?? DEFAULT_SOURCE_CACHE_DIR,
    includeSourceRaw: false,
    outputDir: DEFAULT_OUTPUT_DIR,
    refreshCache: false,
    year: Number.parseInt(process.env.TARGET_YEAR ?? String(new Date().getFullYear()), 10),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--year') {
      args.year = Number.parseInt(requireValue(arg, next), 10);
      index += 1;
    } else if (arg === '--output') {
      args.outputDir = requireValue(arg, next);
      index += 1;
    } else if (arg === '--city-id') {
      args.cityId = Number.parseInt(requireValue(arg, next), 10);
      index += 1;
    } else if (arg === '--cache-dir') {
      args.cacheDir = requireValue(arg, next);
      index += 1;
    } else if (arg === '--refresh-cache') {
      args.refreshCache = true;
    } else if (arg === '--no-cache') {
      args.cache = false;
    } else if (arg === '--include-source-raw') {
      args.includeSourceRaw = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isInteger(args.year) || args.year < 2000 || args.year > 2100) {
    throw new Error('--year must be an integer between 2000 and 2100.');
  }

  if (args.cityId !== null && !Number.isInteger(args.cityId)) {
    throw new Error('--city-id must be an integer.');
  }

  return args;
}

function requireValue(flag, value) {
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value.`);
  }

  return value;
}

function printHelp() {
  console.log(`Generate portable Sweden prayer data from Awqat Salah and Nominatim.

Required environment:
  AWQAT_BASE_URL
  AWQAT_USERNAME
  AWQAT_PASSWORD

Optional environment:
  TARGET_YEAR
  PRAYER_DATA_CACHE_DIR
  NOMINATIM_BASE_URL
  NOMINATIM_USER_AGENT
  NOMINATIM_MIN_DELAY_MS
  AWQAT_USERNAME_FIELD
  AWQAT_PASSWORD_FIELD

Usage:
  npm run generate:prayer-data -- --year 2026
  node scripts/generate-prayer-data.mjs --year 2026 --city-id 14320

Options:
  --year <year>            Year to generate. Defaults to TARGET_YEAR or current year.
  --output <dir>           Output directory. Defaults to ${DEFAULT_OUTPUT_DIR}.
  --city-id <id>           Generate schedules for one Awqat city id after matching all cities.
  --cache-dir <dir>        Source API cache directory. Defaults to ${DEFAULT_SOURCE_CACHE_DIR}.
  --refresh-cache          Ignore existing cache files and overwrite them.
  --no-cache               Disable source API caching for this run.
  --include-source-raw     Include raw Awqat prayer rows in schedule files.
  --help                   Show this help.
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const result = await buildPrayerData(args);
  console.log(`Generated ${result.cities.length} locations and ${result.schedules.length} schedules.`);
  console.log(`Output: ${result.outputDir}`);
  if (result.sourceCacheDir) {
    console.log(`Source API cache: ${result.sourceCacheDir}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
