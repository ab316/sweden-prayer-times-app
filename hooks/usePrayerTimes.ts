import * as awqatSalahApi from "@/api/awqatSalah";
import * as cache from "@/storage/prayerTimesStorage";
import { ICity } from "@/types/ICity";

export const usePrayerTimes = () => {
  const getPrayerTimes = async (params: { city: ICity; year: number }) => {
    const cachedPrayerTimes = await cache.getYearlyPrayerTimes(
      params.city.name,
      params.year
    );

    if (cachedPrayerTimes) {
      console.log(
        `Using cached prayer times for ${params.city.name} ${params.year}.`
      );
      return cachedPrayerTimes;
    } else {
      const apiPrayerTimes = await awqatSalahApi.fetchPrayerTimes({
        coords: params.city.coords,
        year: params.year,
      });

      cache.saveYearPrayerTimes(params.city.name, params.year, apiPrayerTimes);
      return apiPrayerTimes;
    }
  };

  return {
    getPrayerTimes,
  };
};
