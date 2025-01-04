import { CitySelector } from "@/components/CitySelector";
import { PrayerTimes } from "@/components/PrayerTimes";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/hooks/ui";
import { useCities } from "@/hooks/useCities";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Option } from "@/types";
import { ICity } from "@/types/ICity";
import { PrayerTimesByDate } from "@/types/PrayerTimes";
import { getIsoDate } from "@/utils/date";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_CITY: ICity = {
  name: "Stockholm",
  coords: { lat: 59.3327, lon: 18.0656 },
};

type ILoadingState = {
  citiesLoading: boolean;
  prayerTimesLoading: boolean;
  error: Error | null;
};

export default function Index() {
  const theme = useTheme();
  const [date, setDate] = useState(new Date());
  const [cities, setCities] = useState<ICity[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesByDate>({});
  const [currentGeoCity, setCurrentGeoCity] = useState<Option<ICity>>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>();
  const [loadingState, setLoadingState] = useState<ILoadingState>({
    citiesLoading: true,
    prayerTimesLoading: true,
    error: null,
  });

  const { getPrayerTimes } = usePrayerTimes();
  const { getCurrentCity } = useGeoLocation();
  const { getCities } = useCities();

  // Fetch cities and current city
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, citiesLoading: true }));
        const [fetchedCities, geoCity] = await Promise.all([
          getCities(),
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
        city.name.toLowerCase().includes(currentGeoCity.name.toLowerCase()) ||
        city.name.toLowerCase().includes(currentGeoCity.name.toLowerCase())
    );

    setSelectedCity(matchedCity || DEFAULT_CITY);
  }, [currentGeoCity, cities]);

  // Fetch prayer times
  useEffect(() => {
    if (!selectedCity) return;

    const fetchPrayerTimesData = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, prayerTimesLoading: true }));
        const times = await getPrayerTimes({
          city: selectedCity,
          year: date.getFullYear(),
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

  const updateDate = (days: number) => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  const todayPrayers = prayerTimes[getIsoDate(date)];

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
        selectedCity={selectedCity?.name || ""}
        onCityChange={(newCity) => setSelectedCity(newCity)}
      />
      <View style={styles.centeredContainer}>
        <TouchableOpacity
          onPress={() => updateDate(-1)}
          style={styles.arrowButton}
        >
          <Text style={styles.arrowText}>{"<"}</Text>
        </TouchableOpacity>
        <ThemedText style={styles.dateText}>{date.toDateString()}</ThemedText>
        <TouchableOpacity
          onPress={() => updateDate(1)}
          style={styles.arrowButton}
        >
          <Text style={styles.arrowText}>{">"}</Text>
        </TouchableOpacity>
      </View>
      {todayPrayers ? (
        <PrayerTimes times={todayPrayers} />
      ) : (
        <View style={styles.noPrayerTimesContainer}>
          <ThemedText
            variant="primary"
            type="defaultBold"
            style={[styles.noPrayerTimesText]}
          >
            No prayer times available
          </ThemedText>
        </View>
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 24,
  },
  noPrayerTimesContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noPrayerTimesText: {
    fontSize: 18,
    textAlign: "center",
  },
});
