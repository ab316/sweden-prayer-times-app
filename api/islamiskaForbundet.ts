import { IOptionData } from "@/types/IOptionData";
import { Month } from "@/types/Month";
import { PrayerTimesByDay } from "@/types/PrayerTimes";
import {
  parseCities,
  parseIslamiskaForbundentPrayerTimes,
} from "@/utils/parseHtml";

const BASE_URL = "https://www.islamiskaforbundet.se";
const PRAYER_TIME_URL = `${BASE_URL}/wp-content/plugins/bonetider/Bonetider_Widget.php`;
const CITIES_URL = `${BASE_URL}/bonetider/`;

export async function fetchCitiesPage(): Promise<IOptionData[]> {
  console.log("Fetching cities page");
  const response = await fetch(CITIES_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch cities. Response status: ${response.status}`
    );
  }

  const html = await response.text();
  const result = parseCities(html);
  return result;
}

export async function fetchPrayerTimes(input: {
  city: string;
  month: Month;
}): Promise<PrayerTimesByDay> {
  const { city, month } = input;
  console.log("Fetching prayer times for city:", city, "month:", month);
  const response = await fetch(PRAYER_TIME_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      ifis_bonetider_page_city: city,
      ifis_bonetider_page_month: month.toString(),
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch prayer times. Response status: ${response.status}`
    );
  }

  const html = await response.text();

  const result = parseIslamiskaForbundentPrayerTimes(html);
  return result;
}
