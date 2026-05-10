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

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function distanceKm(a: Pick<City, 'lat' | 'lng'>, b: Pick<City, 'lat' | 'lng'>): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export function findNearestCity(lat: number, lng: number): City {
  let best = SWEDISH_CITIES[0];
  let bestDist = Infinity;
  for (const c of SWEDISH_CITIES) {
    const d = distanceKm({ lat, lng }, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}
