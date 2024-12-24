import { fetchCitiesPage, fetchPrayerTimes } from "@/api/islamiskaForbundet";
import { IOptionData } from "@/types/IOptionData";
import { PrayerTimesByDay } from "@/types/PrayerTimes";
import { useEffect, useState } from "react";

interface IPrayerTimeState {
  city: string;
  date: Date;
}

export const usePrayerTimes = ({ city, date }: IPrayerTimeState) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cities, setCities] = useState<IOptionData[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesByDay>({});

  const month = date.getMonth() + 1;

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const cities = await fetchCitiesPage();
        setCities(cities);
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
    async function onCityChanged() {
      try {
        setLoading(true);

        const prayerTimes = await fetchPrayerTimes({ city, month });
        setPrayerTimes(prayerTimes);

        setError(null);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    onCityChanged();
  }, [city, month]);

  return {
    cities,
    prayerTimes,
    loading,
    error,
  };
};
