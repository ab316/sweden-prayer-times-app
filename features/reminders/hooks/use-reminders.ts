import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocation } from '@/features/location';
import { ensureReminderScheduleFresh } from '@/lib/notifications/reminders';
import { loadReminderSettings, saveReminderSettings } from '@/lib/storage';

import {
  DEFAULT_REMINDER_SETTINGS,
  isReminderPrayerKey,
  normalizeReminderSettings,
  type ReminderPrayerKey,
  type ReminderSettings,
  type ReminderType,
} from '../types';

/** Reminder settings state and mutation API used by reminder-aware screens. */
export type UseRemindersResult = {
  settings: ReminderSettings;
  hydrated: boolean;
  setPrayerEnabled: (key: ReminderPrayerKey, enabled: boolean) => void;
  setPrayerType: (key: ReminderPrayerKey, type: ReminderType) => void;
  setGlobal: (enabled: boolean) => void;
};

/** Loads reminder settings for UI controls and persists changes through the app-level scheduler. */
export function useReminders(): UseRemindersResult {
  const { city } = useLocation();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = normalizeReminderSettings(await loadReminderSettings());
      if (cancelled) return;
      if (stored) {
        setSettings(stored);
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Persists settings changes and forces the app-level scheduler to rebuild immediately. */
  const persist = useCallback((next: ReminderSettings, requestPermission: boolean) => {
    setSettings(next);
    void saveReminderSettings(next);
    void ensureReminderScheduleFresh({
      cityId: city.id,
      settings: next,
      requestPermission,
      force: true,
    });
  }, [city.id]);

  /** Enables or disables reminders for one prayer. */
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

  /** Updates the reminder delivery mode for one prayer. */
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

  /** Enables or disables all prayer reminders. */
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
