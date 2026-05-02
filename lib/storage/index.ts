import AsyncStorage from '@react-native-async-storage/async-storage';

import type { City } from '@/features/location/types';
import type { ReminderSettings } from '@/features/reminders/types';

const STORAGE_KEYS = {
  selectedCity: 'sp.location.selectedCity',
  recentCities: 'sp.location.recentCities',
  reminderSettings: 'sp.reminders.settings',
} as const;

const RECENTS_LIMIT = 5;

async function get<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return null;
  return JSON.parse(raw) as T;
}

async function set<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export function loadSelectedCity(): Promise<City | null> {
  return get<City>(STORAGE_KEYS.selectedCity);
}

export function saveSelectedCity(city: City): Promise<void> {
  return set(STORAGE_KEYS.selectedCity, city);
}

export function loadRecentCities(): Promise<City[]> {
  return get<City[]>(STORAGE_KEYS.recentCities).then((v) => v ?? []);
}

export async function pushRecentCity(city: City): Promise<City[]> {
  const existing = await loadRecentCities();
  const next = [city, ...existing.filter((c) => c.id !== city.id)].slice(0, RECENTS_LIMIT);
  await set(STORAGE_KEYS.recentCities, next);
  return next;
}

export function loadReminderSettings(): Promise<ReminderSettings | null> {
  return get<ReminderSettings>(STORAGE_KEYS.reminderSettings);
}

export function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  return set(STORAGE_KEYS.reminderSettings, settings);
}

export async function clearAll(): Promise<void> {
  await Promise.all([
    remove(STORAGE_KEYS.selectedCity),
    remove(STORAGE_KEYS.recentCities),
    remove(STORAGE_KEYS.reminderSettings),
  ]);
}
