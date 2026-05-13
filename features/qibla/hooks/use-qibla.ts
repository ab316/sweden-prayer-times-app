import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { qiblaBearingFromLatLng } from '@/lib/time/qibla';

import type { QiblaState } from '../types';

export type UseQiblaArgs = {
  lat: number;
  lng: number;
};

const normalizeHeading = (heading: number) => ((heading % 360) + 360) % 360;
const shortestAngleDelta = (from: number, to: number) => ((to - from + 540) % 360) - 180;

export function useQibla({ lat, lng }: UseQiblaArgs): QiblaState {
  const [heading, setHeading] = useState(0);
  const [calibrated, setCalibrated] = useState(Platform.OS === 'web');
  const [headingSource, setHeadingSource] = useState<QiblaState['headingSource']>('preview');
  const displayHeadingRef = useRef(0);
  const targetHeadingRef = useRef(0);

  useEffect(() => {
    let active = true;
    let previewInterval: ReturnType<typeof setInterval> | undefined;
    let fallbackTimeout: ReturnType<typeof setTimeout> | undefined;
    let smoothingFrame: ReturnType<typeof requestAnimationFrame> | undefined;
    let subscription: Location.LocationSubscription | undefined;

    const tick = () => {
      if (!active) {
        return;
      }

      const current = displayHeadingRef.current;
      const target = targetHeadingRef.current;
      const delta = shortestAngleDelta(current, target);
      const next = Math.abs(delta) < 0.05 ? target : normalizeHeading(current + delta * 0.14);

      displayHeadingRef.current = next;
      setHeading(next);
      smoothingFrame = requestAnimationFrame(tick);
    };

    smoothingFrame = requestAnimationFrame(tick);

    const startPreview = () => {
      if (!active || previewInterval) {
        return;
      }
      setHeadingSource('preview');
      setCalibrated(true);
      previewInterval = setInterval(() => {
        targetHeadingRef.current = normalizeHeading(targetHeadingRef.current + 0.16);
      }, 16);
    };

    if (Platform.OS === 'web') {
      startPreview();
      return () => {
        active = false;
        if (smoothingFrame) {
          cancelAnimationFrame(smoothingFrame);
        }
        if (previewInterval) {
          clearInterval(previewInterval);
        }
      };
    }

    fallbackTimeout = setTimeout(startPreview, 1500);

    Location.watchHeadingAsync(
      (reading) => {
        if (!active) {
          return;
        }
        const nextHeading = reading.trueHeading >= 0 ? reading.trueHeading : reading.magHeading;
        targetHeadingRef.current = normalizeHeading(nextHeading);
        setHeadingSource('sensor');
        setCalibrated(reading.accuracy >= 2);
        if (fallbackTimeout) {
          clearTimeout(fallbackTimeout);
          fallbackTimeout = undefined;
        }
        if (previewInterval) {
          clearInterval(previewInterval);
          previewInterval = undefined;
        }
      },
      () => {
        startPreview();
      },
    ).then((nextSubscription) => {
      if (active) {
        subscription = nextSubscription;
      } else {
        nextSubscription.remove();
      }
    }).catch(() => {
      startPreview();
    });

    return () => {
      active = false;
      subscription?.remove();
      if (smoothingFrame) {
        cancelAnimationFrame(smoothingFrame);
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
      if (previewInterval) {
        clearInterval(previewInterval);
      }
    };
  }, []);

  const bearing = useMemo(() => qiblaBearingFromLatLng(lat, lng), [lat, lng]);

  return {
    bearing,
    heading,
    calibrated,
    headingSource,
  };
}
