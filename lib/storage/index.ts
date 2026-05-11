import AsyncStorage from '@react-native-async-storage/async-storage';

import type { City } from '@/features/location/types';
import type { ReminderSettings } from '@/features/reminders/types';

const STORAGE_KEYS = {
  selectedCity: 'sp.location.selectedCity',
  recentCities: 'sp.location.recentCities',
  reminderSettings: 'sp.reminders.settings',
} as const;

const RECENTS_LIMIT = 5;

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; callers already update UI state optimistically.
  }
}

async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Clearing preferences should never crash the app.
  }
}

function asCity(value: unknown): City | null {
  if (!value || typeof value !== 'object') return null;
  const city = value as Partial<City>;
  const id = Number(city.id);
  const lat = Number(city.lat);
  const lng = Number(city.lng);
  if (!Number.isFinite(id) || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (typeof city.name !== 'string' || city.name.trim().length === 0) return null;
  return { id, name: city.name, lat, lng };
}

function asRecentCities(value: unknown): City[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<number>();
  const cities: City[] = [];

  for (const item of value) {
    const city = asCity(item);
    if (!city || seen.has(city.id)) continue;
    seen.add(city.id);
    cities.push(city);
    if (cities.length === RECENTS_LIMIT) break;
  }

  return cities;
}

export async function loadSelectedCity(): Promise<City | null> {
  return asCity(await readJson<unknown>(STORAGE_KEYS.selectedCity));
}

export function saveSelectedCity(city: City): Promise<void> {
  return writeJson(STORAGE_KEYS.selectedCity, city);
}

export async function loadRecentCities(): Promise<City[]> {
  return asRecentCities(await readJson<unknown>(STORAGE_KEYS.recentCities));
}

export async function pushRecentCity(city: City): Promise<City[]> {
  const normalized = asCity(city) ?? city;
  const existing = await loadRecentCities();
  const next = [normalized, ...existing.filter((c) => c.id !== normalized.id)].slice(
    0,
    RECENTS_LIMIT,
  );
  await writeJson(STORAGE_KEYS.recentCities, next);
  return next;
}

export function loadReminderSettings(): Promise<ReminderSettings | null> {
  return readJson<ReminderSettings>(STORAGE_KEYS.reminderSettings);
}

export function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  return writeJson(STORAGE_KEYS.reminderSettings, settings);
}

export async function clearAll(): Promise<void> {
  await Promise.all([
    removeKey(STORAGE_KEYS.selectedCity),
    removeKey(STORAGE_KEYS.recentCities),
    removeKey(STORAGE_KEYS.reminderSettings),
  ]);
}
