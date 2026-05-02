import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeAwqatCity, normalizeName, normalizeNominatimLocation, splitParenthetical } from './normalization.mjs';

test('normalizes Swedish and Awqat city forms', () => {
  assert.equal(normalizeName('GOTEBORG'), 'GOTEBORG');
  assert.equal(normalizeName('Göteborg'), 'GOTEBORG');
  assert.equal(normalizeName('MALMÖ'), 'MALMO');
  assert.equal(normalizeName('Växjö'), 'VAXJO');
  assert.equal(normalizeName('Örebro'), 'OREBRO');
  assert.equal(normalizeName('BARA '), 'BARA');
});

test('separates parenthetical qualifiers', () => {
  assert.deepEqual(splitParenthetical('ASA (Halland)'), {
    baseName: 'ASA',
    qualifier: 'Halland',
  });
});

test('applies known source corrections', () => {
  assert.equal(normalizeName('FALKOPÄ°NG'), 'FALKOPING');
  assert.equal(normalizeName('JAKOBSERG (S)'), 'JAKOBSBERG');
});

test('normalizes Awqat city metadata', () => {
  assert.deepEqual(normalizeAwqatCity({ id: 14280, code: 'ASA (Halland)', name: 'ASA (Halland)' }), {
    id: 14280,
    code: 'ASA (Halland)',
    sourceName: 'ASA (Halland)',
    baseName: 'ASA',
    qualifier: 'Halland',
    normalizedName: 'ASA',
  });
});

test('normalizes Nominatim location metadata', () => {
  assert.deepEqual(
    normalizeNominatimLocation({
      awqatCity: normalizeAwqatCity({ id: 14320, code: 'GOTEBORG', name: 'GOTEBORG' }),
      result: {
        category: 'place',
        type: 'city',
        lat: '57.70716',
        lon: '11.96679',
        namedetails: {
          name: 'Göteborg',
        },
      },
    }),
    {
      awqatCityId: 14320,
      awqatName: 'GOTEBORG',
      displayName: 'Göteborg',
      type: 'city',
      lat: 57.70716,
      lng: 11.96679,
      source: 'osm',
    },
  );
});
