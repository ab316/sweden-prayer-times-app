import type { PrayerKey } from '@/features/schedule/types';

export type ReminderPrayerKey = Exclude<PrayerKey, 'sunrise'>;

export function isReminderPrayerKey(key: PrayerKey): key is ReminderPrayerKey {
  return key !== 'sunrise';
}

export type ReminderType = 'adhan+15m' | 'adhan+10m' | 'adhan' | 'silent';

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  'adhan+15m': 'Adhan & 15 min before',
  'adhan+10m': 'Adhan & 10 min before',
  adhan: 'Adhan only',
  silent: 'Silent',
};

export type PrayerReminder = {
  enabled: boolean;
  type: ReminderType;
};

export type ReminderSettings = {
  global: boolean;
  prayers: Record<ReminderPrayerKey, PrayerReminder>;
};

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
