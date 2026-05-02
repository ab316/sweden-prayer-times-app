const SOURCE_TEXT_FIXES = new Map([
  ['FALKOPÄ°NG', 'FALKOPING'],
  ['JAKOBSERG', 'JAKOBSBERG'],
  ['STAFFANSTROP', 'STAFFANSTORP'],
  ['KARLSHAMM', 'KARLSHAMN'],
  ['FLIPSTAD', 'FILIPSTAD'],
]);

export function splitParenthetical(value) {
  const text = String(value ?? '').trim();
  const match = text.match(/^(.*?)\s*\((.*?)\)\s*$/);

  if (!match) {
    return { baseName: text, qualifier: null };
  }

  return {
    baseName: match[1].trim(),
    qualifier: match[2].trim() || null,
  };
}

export function normalizeName(value) {
  const { baseName } = splitParenthetical(value);
  const fixed = SOURCE_TEXT_FIXES.get(baseName.toUpperCase()) ?? baseName;

  return fixed
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä°/g, 'I')
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Æ/g, 'AE')
    .replace(/Ø/g, 'O')
    .replace(/Å/g, 'A')
    .replace(/Ä/g, 'A')
    .replace(/Ö/g, 'O')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function normalizeAwqatCity(city) {
  const rawCode = String(city.code ?? city.name ?? '');
  const { baseName, qualifier } = splitParenthetical(rawCode);
  const normalizedName = normalizeName(rawCode);

  return {
    id: Number(city.id),
    code: rawCode.trim(),
    sourceName: String(city.name ?? '').trim(),
    baseName,
    qualifier,
    normalizedName,
  };
}

export function pickAlternateName(alternateNames, language) {
  const candidates = alternateNames.filter((alternateName) => alternateName.lang === language);

  if (candidates.length === 0) {
    return null;
  }

  const preferred =
    candidates.find((candidate) => candidate.isPreferredName) ??
    candidates.find((candidate) => !candidate.isHistoric && !candidate.isColloquial);

  return preferred?.name ?? candidates[0]?.name ?? null;
}

export function normalizeNominatimLocation({ awqatCity, result }) {
  const lat = roundCoordinate(result.lat);
  const lng = roundCoordinate(result.lon);

  return {
    awqatCityId: awqatCity.id,
    awqatName: awqatCity.code,
    displayName: pickNominatimDisplayName(result, awqatCity),
    type: mapNominatimType(result),
    lat,
    lng,
    source: 'osm',
  };
}

export function pickBestNominatimResult(results) {
  const scored = results
    .filter((result) => Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lon)))
    .map((result) => ({
      result,
      score: scoreNominatimResult(result),
    }))
    .sort((left, right) => right.score - left.score);

  return scored[0]?.result ?? null;
}

export function uniqueStrings(values) {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function roundCoordinate(value) {
  const coordinate = Number(value);

  if (!Number.isFinite(coordinate)) {
    throw new Error(`Invalid coordinate from Nominatim: ${value}`);
  }

  return Number(coordinate.toFixed(6));
}

function pickNominatimDisplayName(result, awqatCity) {
  return (
    result.namedetails?.['name:sv'] ??
    result.namedetails?.name ??
    result.address?.city ??
    result.address?.town ??
    result.address?.municipality ??
    result.address?.village ??
    result.name ??
    awqatCity.baseName
  );
}

function mapNominatimType(result) {
  const category = result.category ?? result.class;
  const type = result.type;

  if (type === 'city' || type === 'town') {
    return 'city';
  }

  if (type === 'municipality' || (category === 'boundary' && type === 'administrative')) {
    return 'municipality';
  }

  if (['village', 'hamlet', 'locality', 'suburb', 'neighbourhood'].includes(type)) {
    return 'locality';
  }

  return 'area';
}

function scoreNominatimResult(result) {
  const category = result.category ?? result.class;
  const type = result.type;
  let score = Number(result.importance ?? 0);

  if (category === 'place') {
    score += 10;
  }

  if (type === 'city' || type === 'town') {
    score += 5;
  } else if (type === 'municipality' || (category === 'boundary' && type === 'administrative')) {
    score += 4;
  } else if (['village', 'hamlet', 'locality', 'suburb', 'neighbourhood'].includes(type)) {
    score += 3;
  }

  return score;
}
