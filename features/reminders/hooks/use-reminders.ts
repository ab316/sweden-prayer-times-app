import { useCallback, useEffect, useState } from 'react';

import { loadReminderSettings, saveReminderSettings } from '@/lib/storage';

import {
  DEFAULT_REMINDER_SETTINGS,
  type ReminderSettings,
  type ReminderType,
} from '../types';
import type { PrayerKey } from '@/features/schedule/types';

export type UseRemindersResult = {
  settings: ReminderSettings;
  hydrated: boolean;
  setPrayerEnabled: (key: PrayerKey, enabled: boolean) => void;
  setPrayerType: (key: PrayerKey, type: ReminderType) => void;
  setGlobal: (enabled: boolean) => void;
};

export function useReminders(): UseRemindersResult {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadReminderSettings();
      if (cancelled) return;
      if (stored) setSettings(stored);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: ReminderSettings) => {
    setSettings(next);
    void saveReminderSettings(next);
  }, []);

  const setPrayerEnabled = useCallback(
    (key: PrayerKey, enabled: boolean) => {
      persist({
        ...settings,
        prayers: {
          ...settings.prayers,
          [key]: { ...settings.prayers[key], enabled },
        },
      });
    },
    [persist, settings],
  );

  const setPrayerType = useCallback(
    (key: PrayerKey, type: ReminderType) => {
      persist({
        ...settings,
        prayers: {
          ...settings.prayers,
          [key]: { ...settings.prayers[key], type },
        },
      });
    },
    [persist, settings],
  );

  const setGlobal = useCallback(
    (enabled: boolean) => {
      persist({ ...settings, global: enabled });
    },
    [persist, settings],
  );

  return { settings, hydrated, setPrayerEnabled, setPrayerType, setGlobal };
}
