import * as api from "@/api/islamiskaForbundet";
import { PrayerTimesByDay } from "@/types/PrayerTimes";

export const usePrayerTimes = () => {
  const fetchPrayerTimes = async (params: { city: string; month: number }) => {
    const prayerTimes: PrayerTimesByDay = await api.fetchPrayerTimes({
      city: params.city,
      month: params.month,
    });
    return prayerTimes;
  };

  const fetchCities = async () => {
    const cities = await api.fetchCitiesPage();
    return cities;
  };

  return {
    fetchCities,
    fetchPrayerTimes,
  };
};
