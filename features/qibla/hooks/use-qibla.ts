import { useEffect, useState } from 'react';

import { qiblaBearingFromLatLng } from '@/lib/time/qibla';

import type { QiblaState } from '../types';

export type UseQiblaArgs = {
  lat: number;
  lng: number;
};

// Compass sensor is out of scope this round (would need expo-sensors + ADR).
// For the prototype we render a slowly-rotating heading so the needle moves
// realistically; bearing is computed from the city's lat/lng.
export function useQibla({ lat, lng }: UseQiblaArgs): QiblaState {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHeading((h) => (h + 1) % 360);
    }, 80);
    return () => clearInterval(id);
  }, []);

  return {
    bearing: qiblaBearingFromLatLng(lat, lng),
    heading,
    calibrated: true,
  };
}
