import { useEffect, useMemo, useState } from 'react';

import { isoDateKey } from '@/lib/time/format';

import { SCHEDULES_2026 } from '../data/registry';
import {
  PRAYER_LABELS,
  PRAYER_ORDER,
  type CitySchedule,
  type DaySchedule,
  type PrayerInstant,
  type PrayerKey,
} from '../types';

export type UseScheduleResult = {
  day: DaySchedule | null;
  city: CitySchedule['city'] | null;
  prayers: PrayerInstant[];
  current: PrayerInstant | null;
  next: PrayerInstant | null;
  loading: boolean;
  error: string | null;
};

function parseTimeOnDate(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const out = new Date(date);
  out.setHours(h, m, 0, 0);
  return out;
}

export function useSchedule(cityId: number, date: Date): UseScheduleResult {
  const [now, setNow] = useState(() => new Date());

  // Tick every minute so the "current"/"next" computation stays fresh.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo<UseScheduleResult>(() => {
    const schedule = SCHEDULES_2026[cityId];
    if (!schedule) {
      return {
        day: null,
        city: null,
        prayers: [],
        current: null,
        next: null,
        loading: false,
        error: `No schedule bundled for city ${cityId}`,
      };
    }
    const key = isoDateKey(date);
    const day = schedule.days.find((d) => d.date === key) ?? null;
    if (!day) {
      return {
        day: null,
        city: schedule.city,
        prayers: [],
        current: null,
        next: null,
        loading: false,
        error: `No prayer times for ${key}`,
      };
    }

    const prayers: PrayerInstant[] = PRAYER_ORDER.map((key) => ({
      key,
      label: PRAYER_LABELS[key],
      time: day.prayers[key],
      date: parseTimeOnDate(date, day.prayers[key]),
    }));

    let current: PrayerInstant | null = null;
    let next: PrayerInstant | null = null;
    for (const p of prayers) {
      if (p.date.getTime() <= now.getTime()) {
        current = p;
      } else if (!next) {
        next = p;
      }
    }
    // If the day's last prayer has passed, "next" is tomorrow's Fajr from the
    // schedule (best-effort; falls back to first prayer of today's list).
    if (!next) {
      const tomorrowKey = isoDateKey(new Date(date.getTime() + 86_400_000));
      const tomorrow = schedule.days.find((d) => d.date === tomorrowKey);
      if (tomorrow) {
        const fajrKey: PrayerKey = 'fajr';
        next = {
          key: fajrKey,
          label: PRAYER_LABELS[fajrKey],
          time: tomorrow.prayers[fajrKey],
          date: parseTimeOnDate(new Date(date.getTime() + 86_400_000), tomorrow.prayers[fajrKey]),
        };
      }
    }

    return {
      day,
      city: schedule.city,
      prayers,
      current,
      next,
      loading: false,
      error: null,
    };
  }, [cityId, date, now]);
}
