import { CitySelector } from "@/components/CitySelector";
import { PrayerTimes } from "@/components/PrayerTimes";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { IOptionData } from "@/types/IOptionData";
import { useState } from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [date, setDate] = useState(new Date());
  const [city, setCity] = useState<IOptionData>({
    value: "Göteborg, SE",
    label: "Göteborg",
  });
  const { cities, prayerTimes, loading, error } = usePrayerTimes({
    city: city.value,
    date,
  });

  const todayPrayers = prayerTimes[date.getDate()];
  console.log(`City: ${city.label}, Day: ${date.getDate()}`);

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <View style={{ padding: 10 }}>
      <View style={{ marginBottom: 20 }}>
        <CitySelector
          cities={cities}
          selectedCity={city.value}
          onCityChange={(newCity) => {
            console.log("City changed to:", newCity);
            setCity(newCity);
          }}
        />
      </View>

      <View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20, marginBottom: 20 }}>
            {date.toDateString()}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            minWidth: 200,
            alignSelf: "center",
          }}
        >
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
});
