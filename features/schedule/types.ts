export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_ORDER: readonly PrayerKey[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

// Keys are canonical (Architecture.md domain language: Sunrise is informational,
// not a prayer). The UI label "Shuruk" used in some Stitch screens maps to "Sunrise".
export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export type ScheduleHijriDate = {
  short: string;
  long: string;
  shortIso8601: string | null;
  longIso8601: string | null;
};

export type DaySchedule = {
  date: string;
  hijri: ScheduleHijriDate;
  prayers: Record<PrayerKey, string>;
};

export type CitySchedule = {
  schemaVersion: number;
  year: number;
  generatedAt: string;
  city: {
    awqatCityId: number;
    displayName: string;
    lat: number;
    lng: number;
  };
  source: {
    provider: string;
    timezone: string;
  };
  days: DaySchedule[];
};

export type PrayerInstant = {
  key: PrayerKey;
  label: string;
  time: string;
  date: Date;
};
