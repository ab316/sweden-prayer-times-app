import { CitySelector } from "@/components/CitySelector";
import { PrayerTimes } from "@/components/PrayerTimes";
import { ThemedText } from "@/components/ui/ThemedText";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { IOptionData } from "@/types/IOptionData";
import { PrayerTimesByDay } from "@/types/PrayerTimes";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [error, setError] = useState<Error | null>(null);
  const [date, setDate] = useState(new Date());
  const [cities, setCities] = useState<IOptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesByDay>({});
  const [currentGeoCity, setCurrentGeoCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<IOptionData | null>();

  const { fetchCities, fetchPrayerTimes } = usePrayerTimes();
  const { getCurrentCity } = useGeoLocation();

  useEffect(() => {
    const init = async () => {
      const [cities, geoCity] = await Promise.all([
        fetchCities(),
        getCurrentCity(),
      ]);

      setCities(cities);
      setCurrentGeoCity(geoCity);

      setIsLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (!currentGeoCity || !cities.length) return;

    const cityOption = cities.find(
      (c) =>
        c.label
          .toLocaleLowerCase()
          .includes(currentGeoCity.toLocaleLowerCase()) ||
        c.value.toLocaleLowerCase().includes(currentGeoCity.toLocaleLowerCase())
    );

    if (cityOption) {
      setSelectedCity(cityOption);
    } else if (!selectedCity) {
      setSelectedCity({
        value: "Stockholm, SE",
        label: "Stockholm",
      });
    }
  }, [cities, currentGeoCity]);

  useEffect(() => {
    if (!selectedCity) return;

    setIsLoading(true);
    fetchPrayerTimes({ city: selectedCity.value, month: date.getMonth() + 1 })
      .then(setPrayerTimes)
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [selectedCity, date]);

  const todayPrayers = prayerTimes[date.getDate()];

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" color="#34A853" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <View style={styles.appBackground}>
      <View style={{ marginBottom: 20 }}>
        <CitySelector
          cities={cities}
          selectedCity={selectedCity?.value ?? ""}
          onCityChange={(newCity) => {
            setSelectedCity(newCity);
          }}
        />
      </View>

      <View>
        <View style={styles.centeredContainer}>
          <ThemedText style={styles.dateText}>{date.toDateString()}</ThemedText>
        </View>

        <View style={styles.prayerTimesContainer}>
          {todayPrayers && <PrayerTimes times={todayPrayers} />}
        </View>
      </View>
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
  prayerTimesContainer: {
    paddingHorizontal: 10,
    minWidth: 200,
    alignSelf: "center",
    borderRadius: 10,
    padding: 15,
  },
});
