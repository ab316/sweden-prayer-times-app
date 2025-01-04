import { ICoodinates } from "@/types/ICoordinates";
import { IPrayerTimes, PrayerTimesByDate } from "@/types/PrayerTimes";
import { getIsoDate } from "@/utils/date";

const BASE_URL = "https://admin.awqatsalah.com";
const API_URL = `${BASE_URL}/api`;

const GET_YEARY_URL = `${API_URL}/PlaceAPI/GetByYearCityId`;

const makeGetYearlyUrl = (coords: ICoodinates, year: number) =>
  `${GET_YEARY_URL}?latitude=${coords.lat}&longitude=${coords.lon}&year=${year}`;

export async function fetchPrayerTimes(input: {
  coords: ICoodinates;
  year: number;
}): Promise<PrayerTimesByDate> {
  const { coords, year } = input;
  console.log("Fetching prayer times for coords:", coords, "year:", year);
  const url = makeGetYearlyUrl(coords, year);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch prayer times. Response status: ${response.status}`
    );
  }

  const json = (await response.json()) as GetByYearCityIdResponse;

  let result: PrayerTimesByDate = {};
  json.daily.data.forEach((day) => {
    const date = new Date(day.gregorianDateLongIso8601);
    const key = getIsoDate(date);
    const value: IPrayerTimes = {
      fajr: day.fajr,
      shuruk: day.sunrise,
      dhuhr: day.dhuhr,
      asr: day.asr,
      maghrib: day.maghrib,
      isha: day.isha,
      sunset: day.astronomicalSunset,
      sunrise: day.astronomicalSunrise,
      hijriDate: day.hijriDateShort,
      gregorianDate: key,
    };

    result[key] = value;
  });

  return result;
}

type GetByYearCityIdResponse = {
  data: {
    id: number;
    name: string;
  };
  daily: {
    data: {
      fajr: string;
      sunrise: string;
      dhuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
      astronomicalSunset: string;
      astronomicalSunrise: string;
      hijriDateShort: string;
      gregorianDateShort: string;
      gregorianDateShortIso8601: string;
      gregorianDateLongIso8601: string;
    }[];
  };
};
