import { fetchCitiesPage, fetchPrayerTimes } from "@/api/islamiskaforbundet";
import { CitySelector } from "@/components/CitySelector";
import { IOptionData } from "@/types/IOptionData";
import { Month } from "@/types/Month";
import { DomUtils, parseDocument } from "htmlparser2";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const prayers = [
  { name: "Fajr", time: "5:00 AM" },
  { name: "Dhuhr", time: "1:00 PM" },
  { name: "Asr", time: "4:00 PM" },
  { name: "Maghrib", time: "7:00 PM" },
  { name: "Isha", time: "9:00 PM" },
];

interface IPrayerTimeState {
  city: IOptionData;
  month: Month;
  day: number;
}

export default function Index() {
  const [cities, setCities] = useState<IOptionData[]>([
    { value: "Göteborg, SE", label: "Göteborg" },
  ]);
  const [prayerTimeState, setPrayerTimeState] = useState<IPrayerTimeState>({
    city: { value: "", label: "" },
    month: new Date().getMonth() as Month,
    day: new Date().getDate(),
  });

  async function init() {
    const citiesResult = await getCities();
    setCities(citiesResult);

    const gbg = citiesResult.find((city) => city.label.includes("Göteborg"));
    const city = gbg ?? citiesResult[0];

    setPrayerTimeState({
      ...prayerTimeState,
      city,
    });
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    fetchPrayerTimes({
      city: prayerTimeState.city.value,
      month: prayerTimeState.month,
    });
  }, [prayerTimeState]);

  return (
    <View style={{ padding: 10 }}>
      <SafeAreaView style={{ marginBottom: 10, padding: 10, width: "100%" }}>
        <CitySelector cities={cities} />
      </SafeAreaView>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 20, marginBottom: 20 }}>
          Here are the prayer times:
        </Text>

        <View style={{ flexDirection: "row", marginBottom: 10, minWidth: 200 }}>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Prayer</Text>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Time</Text>
        </View>
        {prayers.map((prayer) => (
          <View
            key={prayer.name}
            style={{ flexDirection: "row", marginBottom: 5, minWidth: 200 }}
          >
            <Text style={{ flex: 1 }}>{prayer.name}</Text>
            <Text style={{ flex: 1 }}>{prayer.time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

async function getCities(): Promise<IOptionData[]> {
  const html = await fetchCitiesPage();

  const dom = parseDocument(html);
  const selectElement = DomUtils.findOne(
    (elem) =>
      elem.type === "tag" &&
      elem.name === "select" &&
      elem.attribs.id === "ifis_bonetider_page_cities",
    dom.children
  );

  if (!selectElement) {
    return [];
  }

  const options = DomUtils.findAll(
    (elem) => elem.type === "tag" && elem.name === "option",
    selectElement.children
  );

  const result = options.map<IOptionData>((option) => ({
    value: option.attribs.value || "",
    label: DomUtils.textContent(option).trim(),
  }));

  return result;
}
