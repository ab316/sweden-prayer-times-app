import { useCallback, useEffect, useSyncExternalStore, useState } from 'react';

import {
  loadRecentCities,
  loadSelectedCity,
  pushRecentCity,
  saveSelectedCity,
} from '@/lib/storage';

import { DEFAULT_CITY, type City } from '../types';

export type UseLocationResult = {
  city: City;
  recentCities: City[];
  detecting: boolean;
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

  // Geolocation is not wired this round (no expo-location dep). We surface a
  // detecting state for UI parity with the design; it resolves to the current
  // city after a short delay so the spinner is observable.
  const detectLocation = useCallback(async () => {
    setDetecting(true);
    await new Promise((r) => setTimeout(r, 600));
    setDetecting(false);
  }, []);

  return { city, recentCities, detecting, hydrated, selectCity, detectLocation };
}
