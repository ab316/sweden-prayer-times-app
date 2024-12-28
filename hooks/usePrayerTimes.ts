import * as api from "@/api/islamiskaForbundet";
import * as cache from "@/storage/prayerTimesStorage";

export const usePrayerTimes = () => {
  const fetchPrayerTimes = async (params: { city: string; month: number }) => {
    const cachedPrayerTimes = await cache.getPrayerTimes(
      params.city,
      params.month
    );
    if (cachedPrayerTimes) {
      return cachedPrayerTimes;
    } else {
      const apiPrayerTimes = await api.fetchPrayerTimes({
        city: params.city,
        month: params.month,
      });

      cache.savePrayerTimes(params.city, params.month, apiPrayerTimes);
      return apiPrayerTimes;
    }
  };

  const fetchCities = async () => {
    const cachedCities = await cache.getCities();
    if (cachedCities) {
      return cachedCities;
    } else {
      const apiCities = await api.fetchCitiesPage();
      cache.saveCities(apiCities);
      return apiCities;
    }
  };

  return {
    fetchCities,
    fetchPrayerTimes,
  };
};
