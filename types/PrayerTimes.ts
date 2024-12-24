export interface IPrayerTimes {
  fajr: string;
  shuruk: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export type PrayerTimesByDay = Record<number, IPrayerTimes>;
