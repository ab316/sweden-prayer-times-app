import * as Location from 'expo-location';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
  loadRecentCities,
  loadSelectedCity,
  pushRecentCity,
  saveSelectedCity,
} from '@/lib/storage';

import { DEFAULT_CITY, findNearestCity, type City } from '../types';

export type UseLocationResult = {
  city: City;
  recentCities: City[];
  detecting: boolean;
  detectionError: string | null;
  hydrated: boolean;
  selectCity: (city: City) => Promise<void>;
  detectLocation: () => Promise<void>;
};

type LocationSnapshot = {
  city: City;
  recentCities: City[];
  hydrated: boolean;
};

let snapshot: LocationSnapshot = {
  city: DEFAULT_CITY,
  recentCities: [],
  hydrated: false,
};

let hydratePromise: Promise<void> | null = null;
let revision = 0;
const listeners = new Set<() => void>();
const RECENT_POSITION_MAX_AGE_MS = 60 * 1000;
const RECENT_POSITION_REQUIRED_ACCURACY_METERS = 5000;

function emit(next: Partial<LocationSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function hydrateLocation() {
  if (!hydratePromise) {
    const startRevision = revision;
    hydratePromise = (async () => {
      const [stored, recents] = await Promise.all([loadSelectedCity(), loadRecentCities()]);
      if (startRevision === revision) {
        emit({
          city: stored ?? DEFAULT_CITY,
          recentCities: recents,
          hydrated: true,
        });
      } else {
        emit({ hydrated: true });
      }
    })();
  }
  return hydratePromise;
}

export function useLocation(): UseLocationResult {
  const { city, recentCities, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  const [detecting, setDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  useEffect(() => {
    hydrateLocation();
  }, []);

  const selectCity = useCallback(async (next: City) => {
    revision += 1;
    emit({ city: next });
    await saveSelectedCity(next);
    const updated = await pushRecentCity(next);
    emit({ recentCities: updated });
  }, []);

  const detectLocation = useCallback(async () => {
    setDetecting(true);
    setDetectionError(null);

    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (!permission.granted) {
        setDetectionError('Location permission was not granted.');
        return;
      }

      const position =
        (await Location.getLastKnownPositionAsync({
          maxAge: RECENT_POSITION_MAX_AGE_MS,
          requiredAccuracy: RECENT_POSITION_REQUIRED_ACCURACY_METERS,
        })) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));

      const nearest = findNearestCity(position.coords.latitude, position.coords.longitude);
      await selectCity(nearest);
    } catch {
      setDetectionError('Could not detect your location. Please try again or choose a city.');
    } finally {
      setDetecting(false);
    }
  }, [selectCity]);

  return { city, recentCities, detecting, detectionError, hydrated, selectCity, detectLocation };
}
