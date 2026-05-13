import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocation } from '@/features/location';
import { rebuildReminderSchedule } from '@/lib/notifications/reminders';
import { loadReminderSettings, saveReminderSettings } from '@/lib/storage';
import { isoDateKey } from '@/lib/time/format';

import {
  DEFAULT_REMINDER_SETTINGS,
  isReminderPrayerKey,
  type ReminderSettings,
  type ReminderPrayerKey,
  type ReminderType,
} from '../types';

export type UseRemindersResult = {
  settings: ReminderSettings;
  hydrated: boolean;
  setPrayerEnabled: (key: ReminderPrayerKey, enabled: boolean) => void;
  setPrayerType: (key: ReminderPrayerKey, type: ReminderType) => void;
  setGlobal: (enabled: boolean) => void;
};

function normalizeReminderSettings(value: ReminderSettings | null): ReminderSettings | null {
  if (!value) return null;

  return {
    global: typeof value.global === 'boolean' ? value.global : DEFAULT_REMINDER_SETTINGS.global,
    prayers: {
      fajr: value.prayers?.fajr ?? DEFAULT_REMINDER_SETTINGS.prayers.fajr,
      dhuhr: value.prayers?.dhuhr ?? DEFAULT_REMINDER_SETTINGS.prayers.dhuhr,
      asr: value.prayers?.asr ?? DEFAULT_REMINDER_SETTINGS.prayers.asr,
      maghrib: value.prayers?.maghrib ?? DEFAULT_REMINDER_SETTINGS.prayers.maghrib,
      isha: value.prayers?.isha ?? DEFAULT_REMINDER_SETTINGS.prayers.isha,
    },
  };
}

export function useReminders(): UseRemindersResult {
  const { city, hydrated: locationHydrated } = useLocation();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [scheduleDateKey, setScheduleDateKey] = useState(() => isoDateKey(new Date()));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = normalizeReminderSettings(await loadReminderSettings());
      if (cancelled) return;
      if (stored) setSettings(stored);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: ReminderSettings, requestPermission: boolean) => {
    setSettings(next);
    void saveReminderSettings(next);
    void rebuildReminderSchedule({
      cityId: city.id,
      settings: next,
      requestPermission,
    });
  }, [city.id]);

  useEffect(() => {
    if (!hydrated || !locationHydrated) return;

    void rebuildReminderSchedule({
      cityId: city.id,
      settings,
      requestPermission: false,
    });
  }, [city.id, hydrated, locationHydrated, scheduleDateKey, settings]);

  useEffect(() => {
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 5, 0);

    const timeout = setTimeout(() => {
      setScheduleDateKey(isoDateKey(new Date()));
    }, nextDay.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [scheduleDateKey]);

  const setPrayerEnabled = useCallback(
    (key: ReminderPrayerKey, enabled: boolean) => {
      if (!isReminderPrayerKey(key)) return;
      persist({
        ...settings,
        prayers: {
          ...settings.prayers,
          [key]: { ...settings.prayers[key], enabled },
        },
      }, enabled);
    },
    [persist, settings],
  );

  const setPrayerType = useCallback(
    (key: ReminderPrayerKey, type: ReminderType) => {
      persist({
        ...settings,
        prayers: {
          ...settings.prayers,
          [key]: { ...settings.prayers[key], type },
        },
      }, type !== 'silent');
    },
    [persist, settings],
  );

  const setGlobal = useCallback(
    (enabled: boolean) => {
      persist({ ...settings, global: enabled }, enabled);
    },
    [persist, settings],
  );

  return useMemo(
    () => ({ settings, hydrated, setPrayerEnabled, setPrayerType, setGlobal }),
    [hydrated, setGlobal, setPrayerEnabled, setPrayerType, settings],
  );
}
