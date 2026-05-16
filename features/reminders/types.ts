import type { PrayerKey } from '@/features/schedule/types';

/** Prayer keys that can produce reminder notifications; sunrise is informational only. */
export type ReminderPrayerKey = Exclude<PrayerKey, 'sunrise'>;

/** Narrows a schedule prayer key to the subset that can be toggled for reminders. */
export function isReminderPrayerKey(key: PrayerKey): key is ReminderPrayerKey {
  return key !== 'sunrise';
}

/** Stored reminder modes; pre-alert variants are normalized to prayer-time adhan for now. */
export type ReminderType = 'adhan+15m' | 'adhan+10m' | 'adhan' | 'silent';

/** User-facing copy for each stored reminder mode. */
export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  'adhan+15m': 'Adhan at prayer time',
  'adhan+10m': 'Adhan at prayer time',
  adhan: 'Adhan at prayer time',
  silent: 'Silent',
};

/** Per-prayer reminder preference as stored in device persistence. */
export type PrayerReminder = {
  enabled: boolean;
  type: ReminderType;
};

/** Global and per-prayer reminder preferences. */
export type ReminderSettings = {
  global: boolean;
  prayers: Record<ReminderPrayerKey, PrayerReminder>;
};

/** Default reminder state for a first install or unreadable stored settings. */
export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  global: false,
  prayers: {
    fajr: { enabled: false, type: 'adhan+15m' },
    dhuhr: { enabled: false, type: 'adhan' },
    asr: { enabled: false, type: 'adhan' },
    maghrib: { enabled: false, type: 'adhan+10m' },
    isha: { enabled: false, type: 'adhan' },
  },
};

/** Metadata for the rolling OS notification schedule currently registered by the app. */
export type ReminderScheduleMetadata = {
  cityId: number;
  settingsHash: string;
  scheduledThrough: string | null;
  scheduledCount: number;
  lastRebuiltAt: string;
};

/** Collapses legacy pre-alert reminder modes to the currently implemented prayer-time mode. */
export function normalizeReminderType(type: ReminderType | undefined): ReminderType {
  if (type === 'silent') return 'silent';
  return 'adhan';
}

/** Normalizes one prayer reminder, preserving enabled state while migrating old reminder types. */
function normalizePrayerReminder(
  value: PrayerReminder | undefined,
  fallback: PrayerReminder,
): PrayerReminder {
  return {
    enabled: typeof value?.enabled === 'boolean' ? value.enabled : fallback.enabled,
    type: normalizeReminderType(value?.type),
  };
}

/** Normalizes persisted reminder settings and migrates legacy reminder type values. */
export function normalizeReminderSettings(value: ReminderSettings | null): ReminderSettings | null {
  if (!value) return null;

  return {
    global: typeof value.global === 'boolean' ? value.global : DEFAULT_REMINDER_SETTINGS.global,
    prayers: {
      fajr: normalizePrayerReminder(value.prayers?.fajr, DEFAULT_REMINDER_SETTINGS.prayers.fajr),
      dhuhr: normalizePrayerReminder(value.prayers?.dhuhr, DEFAULT_REMINDER_SETTINGS.prayers.dhuhr),
      asr: normalizePrayerReminder(value.prayers?.asr, DEFAULT_REMINDER_SETTINGS.prayers.asr),
      maghrib: normalizePrayerReminder(
        value.prayers?.maghrib,
        DEFAULT_REMINDER_SETTINGS.prayers.maghrib,
      ),
      isha: normalizePrayerReminder(value.prayers?.isha, DEFAULT_REMINDER_SETTINGS.prayers.isha),
    },
  };
}
