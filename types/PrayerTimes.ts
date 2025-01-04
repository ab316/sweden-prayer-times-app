export interface IPrayerTimes {
  fajr: string;
  shuruk: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sunset?: string;
  sunrise?: string;
  hijriDate?: string;
  gregorianDate?: string;
}

// Used by api/islamiskaForbundet.ts that we are not using anymore.
export type PrayerTimesByDay = Record<number, IPrayerTimes>;

export type PrayerTimesByDate = Record<string, IPrayerTimes>;
