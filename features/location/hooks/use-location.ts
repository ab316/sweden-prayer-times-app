import { useCallback, useEffect, useState } from 'react';

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

export function useLocation(): UseLocationResult {
  const [city, setCity] = useState<City>(DEFAULT_CITY);
  const [recentCities, setRecentCities] = useState<City[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [stored, recents] = await Promise.all([loadSelectedCity(), loadRecentCities()]);
      if (cancelled) return;
      if (stored) setCity(stored);
      setRecentCities(recents);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectCity = useCallback(async (next: City) => {
    setCity(next);
    await saveSelectedCity(next);
    const updated = await pushRecentCity(next);
    setRecentCities(updated);
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
