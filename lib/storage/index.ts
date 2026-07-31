import AsyncStorage from '@react-native-async-storage/async-storage';

import type { City } from '@/features/location/types';
import type { ReminderScheduleMetadata, ReminderSettings } from '@/features/reminders/types';

const STORAGE_KEYS = {
  selectedCity: 'sp.location.selectedCity',
  recentCities: 'sp.location.recentCities',
  reminderSettings: 'sp.reminders.settings',
  reminderScheduleMetadata: 'sp.reminders.scheduleMetadata',
  reminderDebugMode: 'sp.debug.reminderAlerts',
} as const;

const RECENTS_LIMIT = 5;

/** Reads and parses JSON from AsyncStorage, returning null for missing or invalid data. */
async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Writes JSON to AsyncStorage without surfacing persistence failures to callers. */
async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; callers already update UI state optimistically.
  }
}

/** Removes one AsyncStorage key without surfacing persistence failures to callers. */
async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Clearing preferences should never crash the app.
  }
}

/** Converts unknown persisted data into a valid City object. */
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

/** Converts unknown persisted data into a de-duplicated recent-cities list. */
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

/** Loads the currently selected city, if one has been persisted. */
export async function loadSelectedCity(): Promise<City | null> {
  return asCity(await readJson<unknown>(STORAGE_KEYS.selectedCity));
}

/** Persists the currently selected city. */
export function saveSelectedCity(city: City): Promise<void> {
  return writeJson(STORAGE_KEYS.selectedCity, city);
}

/** Loads the user's recent city list. */
export async function loadRecentCities(): Promise<City[]> {
  return asRecentCities(await readJson<unknown>(STORAGE_KEYS.recentCities));
}

/** Adds a city to the front of the recent list, de-duplicated and capped. */
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

/** Loads stored reminder settings, returning raw data for feature-level normalization. */
export function loadReminderSettings(): Promise<ReminderSettings | null> {
  return readJson<ReminderSettings>(STORAGE_KEYS.reminderSettings);
}

/** Persists reminder settings after the UI updates optimistically. */
export function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  return writeJson(STORAGE_KEYS.reminderSettings, settings);
}

/** Loads metadata describing the prayer reminders currently registered with the OS. */
export function loadReminderScheduleMetadata(): Promise<ReminderScheduleMetadata | null> {
  return readJson<ReminderScheduleMetadata>(STORAGE_KEYS.reminderScheduleMetadata);
}

/** Persists metadata after rebuilding the rolling prayer reminder schedule. */
export function saveReminderScheduleMetadata(
  metadata: ReminderScheduleMetadata,
): Promise<void> {
  return writeJson(STORAGE_KEYS.reminderScheduleMetadata, metadata);
}

/** Clears reminder schedule metadata when prayer reminders are cancelled or reset. */
export function clearReminderScheduleMetadata(): Promise<void> {
  return removeKey(STORAGE_KEYS.reminderScheduleMetadata);
}

/** Loads the debug reminder alerts preference. Returns null if never set. */
export function loadReminderDebugMode(): Promise<boolean | null> {
  return readJson<boolean>(STORAGE_KEYS.reminderDebugMode);
}

/** Persists the debug reminder alerts preference. */
export function saveReminderDebugMode(enabled: boolean): Promise<void> {
  return writeJson(STORAGE_KEYS.reminderDebugMode, enabled);
}

/** Clears all app preferences and reminder schedule metadata. */
export async function clearAll(): Promise<void> {
  await Promise.all([
    removeKey(STORAGE_KEYS.selectedCity),
    removeKey(STORAGE_KEYS.recentCities),
    removeKey(STORAGE_KEYS.reminderSettings),
    removeKey(STORAGE_KEYS.reminderScheduleMetadata),
  ]);
}
