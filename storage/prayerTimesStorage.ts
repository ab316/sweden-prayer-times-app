import { ICity } from "@/types/ICity";
import { PrayerTimesByDate, PrayerTimesByDay } from "@/types/PrayerTimes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PRAYER_TIMES_KEY = "PRAYER_TIMES";
const PRAYER_TIMES_YEARLY_KEY = "PRAYER_TIMES_YEARLY";
const CITIES_KEY = "CITIES";

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

export const saveMonthlyPrayerTimes = async (
  city: string,
  month: number,
  prayerTimes: PrayerTimesByDay
) => {
  try {
    const key = `${PRAYER_TIMES_KEY}:${city}:${month}`;
    const timestamp = Date.now();
    const data = JSON.stringify({ timestamp, prayerTimes });
    await AsyncStorage.setItem(key, data);
  } catch (err) {
    console.error("Failed to save prayer times", err);
  }
};

export const saveYearPrayerTimes = async (
  city: string,
  year: number,
  prayerTimes: PrayerTimesByDate
) => {
  try {
    const key = `${PRAYER_TIMES_YEARLY_KEY}:${city}:${year}`;
    const timestamp = Date.now();
    const data = JSON.stringify({ timestamp, prayerTimes });
    await AsyncStorage.setItem(key, data);
  } catch (err) {
    console.error("Failed to save prayer times", err);
  }
};

export const getMonthlyPrayerTimes = async (
  city: string,
  month: number
): Promise<PrayerTimesByDay | null> => {
  try {
    const key = `${PRAYER_TIMES_KEY}:${city}:${month}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;

    const { prayerTimes, timestamp } = JSON.parse(data);
    // Remove prayer times if older than a week
    if (Date.now() - timestamp > ONE_WEEK) {
      AsyncStorage.removeItem(key);
      return null;
    }
    return prayerTimes;
  } catch (err) {
    console.error("Failed to get prayer times", err);
    return null;
  }
};

export const getYearlyPrayerTimes = async (
  city: string,
  year: number
): Promise<PrayerTimesByDate | null> => {
  try {
    const key = `${PRAYER_TIMES_YEARLY_KEY}:${city}:${year}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;

    const { prayerTimes, timestamp } = JSON.parse(data);
    // Remove prayer times if older than a week
    if (Date.now() - timestamp > ONE_WEEK) {
      AsyncStorage.removeItem(key);
      return null;
    }
    return prayerTimes;
  } catch (err) {
    console.error("Failed to get prayer times", err);
    return null;
  }
};

export const saveCities = async (cities: ICity[]) => {
  try {
    const timestamp = Date.now();
    const data = JSON.stringify({ timestamp, cities });
    await AsyncStorage.setItem(CITIES_KEY, data);
  } catch (err) {
    console.error("Failed to save cities", err);
  }
};

export const getCities = async (): Promise<ICity[] | null> => {
  try {
    const data = await AsyncStorage.getItem(CITIES_KEY);
    if (!data) return null;

    const parsedData = JSON.parse(data);
    const { cities } = parsedData;

    return cities;
  } catch (err) {
    console.error("Failed to get cities from cache.", err);
    return null;
  }
};
