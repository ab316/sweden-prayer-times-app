import { Month } from "@/types/Month";

const BASE_URL = "https://www.islamiskaforbundet.se";
const PRAYER_TIME_URL = `${BASE_URL}/wp-content/plugins/bonetider/Bonetider_Widget.php`;
const CITIES_URL = `${BASE_URL}/bonetider/`;


export async function fetchCitiesPage(): Promise<string> {
  const response = await fetch(CITIES_URL);
  const html = await response.text();
  return html;
}

export async function fetchPrayerTimes(input: { city: string; month: Month }) {
  const { city, month } = input;
  console.log('Fetching prayer times for city:', city, 'month:', month);
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

  const html = await response.text();
  return html;
}
