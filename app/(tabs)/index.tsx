import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { CitySelector } from "@/components/CitySelector";
import { PrayerTimes } from "@/components/PrayerTimes";
import { ThemedText } from "@/components/ui/ThemedText";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { IOptionData } from "@/types/IOptionData";
import { PrayerTimesByDay } from "@/types/PrayerTimes";

const DEFAULT_CITY = { value: "Stockholm, SE", label: "Stockholm" };

type ILoadingState = {
  citiesLoading: boolean;
  prayerTimesLoading: boolean;
  error: Error | null;
};

export default function Index() {
  const [date, setDate] = useState(new Date());
  const [cities, setCities] = useState<IOptionData[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesByDay>({});
  const [currentGeoCity, setCurrentGeoCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<IOptionData | null>();
  const [loadingState, setLoadingState] = useState<ILoadingState>({
    citiesLoading: true,
    prayerTimesLoading: true,
    error: null,
  });

  const { fetchCities, fetchPrayerTimes } = usePrayerTimes();
  const { getCurrentCity } = useGeoLocation();

  // Fetch cities and current city
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, citiesLoading: true }));
        const [fetchedCities, geoCity] = await Promise.all([
          fetchCities(),
          getCurrentCity(),
        ]);
        setCities(fetchedCities);
        setCurrentGeoCity(geoCity);
      } catch (err) {
        setLoadingState((prev) => ({ ...prev, error: err as Error }));
      } finally {
        setLoadingState((prev) => ({ ...prev, citiesLoading: false }));
      }
    };

    init();
  }, []);

  // Determine selected city
  useEffect(() => {
    if (!currentGeoCity || !cities.length) return;

    const matchedCity = cities.find(
      (city) =>
        city.label.toLowerCase().includes(currentGeoCity.toLowerCase()) ||
        city.value.toLowerCase().includes(currentGeoCity.toLowerCase())
    );

    setSelectedCity(matchedCity || DEFAULT_CITY);
  }, [currentGeoCity, cities]);

  // Fetch prayer times
  useEffect(() => {
    if (!selectedCity) return;

    const fetchPrayerTimesData = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, prayerTimesLoading: true }));
        const times = await fetchPrayerTimes({
          city: selectedCity.value,
          month: date.getMonth() + 1,
        });
        setPrayerTimes(times);
      } catch (err) {
        setLoadingState((prev) => ({ ...prev, error: err as Error }));
      } finally {
        setLoadingState((prev) => ({ ...prev, prayerTimesLoading: false }));
      }
    };

    fetchPrayerTimesData();
  }, [selectedCity, date]);

  const todayPrayers = prayerTimes[date.getDate()];

  // Loading/Error states
  if (loadingState.error) {
    return <Text>Error: {loadingState.error.message}</Text>;
  }

  if (loadingState.citiesLoading || loadingState.prayerTimesLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" color="#34A853" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Main UI
  return (
    <View style={styles.appBackground}>
      <CitySelector
        cities={cities}
        selectedCity={selectedCity?.value || ""}
        onCityChange={(newCity) => setSelectedCity(newCity)}
      />
      <View style={styles.centeredContainer}>
        <ThemedText style={styles.dateText}>{date.toDateString()}</ThemedText>
      </View>
      {todayPrayers ? (
        <PrayerTimes times={todayPrayers} />
      ) : (
        <Text>No prayer times available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  appBackground: {
    flex: 1,
    padding: 10,
  },
  centeredContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
  },
});
