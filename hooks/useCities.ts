import * as cache from "@/storage/prayerTimesStorage";
import * as api from "@/api/overpassApi";

export const useCities = () => {
  const getCities = async () => {
    const cachedCities = await cache.getCities();
    if (cachedCities) {
      console.log("Fetched cities from cache.");
      return cachedCities;
    } else {
      const apiCities = await api.fetchCitiesInSweden();
      if (!apiCities) {
        throw new Error("Failed to fetch cities.");
      }

      const sortedCities = apiCities.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      cache.saveCities(sortedCities);
      return apiCities;
    }
  };

  return {
    getCities,
  };
};
