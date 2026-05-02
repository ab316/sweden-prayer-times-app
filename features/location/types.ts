import citiesData from '@/features/schedule/data/prayer-data/cities.json';

export type City = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

export type RawCity = {
  awqatCityId: number;
  displayName: string;
  lat: number;
  lng: number;
};

export const SWEDISH_CITIES: City[] = (citiesData as RawCity[])
  .map((c) => ({ id: c.awqatCityId, name: c.displayName, lat: c.lat, lng: c.lng }))
  .sort((a, b) => a.name.localeCompare(b.name, 'sv'));

const POPULAR_NAMES = [
  'Stockholm',
  'Göteborg',
  'Malmö',
  'Uppsala',
  'Västerås',
  'Örebro',
  'Linköping',
  'Helsingborg',
  'Jönköping',
  'Norrköping',
  'Lund',
  'Umeå',
  'Gävle',
  'Borås',
  'Sundsvall',
  'Eskilstuna',
  'Södertälje',
  'Karlstad',
  'Växjö',
  'Halmstad',
];

export const POPULAR_CITIES: City[] = POPULAR_NAMES
  .map((name) => SWEDISH_CITIES.find((c) => c.name === name))
  .filter((c): c is City => Boolean(c));

export const DEFAULT_CITY: City =
  SWEDISH_CITIES.find((c) => c.name === 'Göteborg') ?? SWEDISH_CITIES[0];

export function findNearestCity(lat: number, lng: number): City {
  let best = SWEDISH_CITIES[0];
  let bestDist = Infinity;
  for (const c of SWEDISH_CITIES) {
    const dLat = c.lat - lat;
    const dLng = c.lng - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}
