import { CitySelector } from "@/components/CitySelector";
import { PrayerTimes } from "@/components/PrayerTimes";
import { ThemedText } from "@/components/ui/ThemedText";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { IOptionData } from "@/types/IOptionData";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [date, setDate] = useState(new Date());
  const [city, setCity] = useState<IOptionData>({
    value: "Stockholm, SE",
    label: "Stockholm",
  });
  const { cities, prayerTimes, loading, error } = usePrayerTimes({
    city: city.value,
    date,
  });
  const { city: geoCity } = useGeoLocation();

  useEffect(() => {
    if (!geoCity) return;

    const cityOption = cities.find(
      (c) =>
        c.label.toLocaleLowerCase().includes(geoCity.toLocaleLowerCase()) ||
        c.value.toLocaleLowerCase().includes(geoCity.toLocaleLowerCase())
    );

    if (cityOption) {
      setCity(cityOption);
    }
  }, [cities, geoCity]);

  const todayPrayers = prayerTimes[date.getDate()];

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (loading) {
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
          selectedCity={city.value}
          onCityChange={(newCity) => {
            setCity(newCity);
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
