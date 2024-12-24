import { fetchCitiesPage, fetchPrayerTimes } from "@/api/islamiskaforbundet";
import { IOptionData } from "@/types/IOptionData";
import { PrayerTimesByDay } from "@/types/PrayerTimes";
import { useEffect, useState } from "react";

interface IPrayerTimeState {
  city: string;
  date: Date;
}

interface IApiData {
  cities: IOptionData[];
  prayerTimes: PrayerTimesByDay;
}

export const usePrayerTimes = ({ city, date }: IPrayerTimeState) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [apiData, setApiData] = useState<IApiData>({
    cities: [],
    prayerTimes: {},
  });

  const month = date.getMonth() + 1;

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const cities = await fetchCitiesPage();
        const prayerTimes = await fetchPrayerTimes({
          city: city,
          month,
        });

        setApiData({ cities, prayerTimes });
        setError(null);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    console.log("City changed to:", city);
    async function doIt() {
      try {
        setLoading(true);

        const prayerTimes = await fetchPrayerTimes({
          city: city,
          month,
        });
        setApiData({ ...apiData, prayerTimes: prayerTimes });

        setError(null);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    doIt();
  }, [city, month]);

  return {
    cities: apiData.cities,
    prayerTimes: apiData.prayerTimes,
    loading,
    error,
  };
};
