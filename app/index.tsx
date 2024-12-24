import { CitySelector } from "@/components/CitySelector";
import { PrayerTimes } from "@/components/PrayerTimes";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { IOptionData } from "@/types/IOptionData";
import { useState } from "react";
import { Text, View } from "react-native";

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

  return (
    <View style={{ padding: 10 }}>
      <View style={{ marginBottom: 10, padding: 10, width: "100%" }}>
        <CitySelector
          cities={cities}
          selectedCity={city.value}
          onCityChange={(newCity) => {
            console.log("City changed to:", newCity);
            setCity(newCity);
          }}
        />
      </View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          width: "100%",
        }}
      >
        <Text style={{ fontSize: 20, marginBottom: 20 }}>
          {date.toDateString()}
        </Text>

        <View style={{ flexDirection: "row", marginBottom: 10, minWidth: 200 }}>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Prayer</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Time</Text>
        </View>

        {todayPrayers && <PrayerTimes date={new Date()} times={todayPrayers} />}
      </View>
    </View>
  );
}
