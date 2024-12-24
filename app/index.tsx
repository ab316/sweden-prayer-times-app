import { fetchCitiesPage, fetchPrayerTimes } from "@/api/islamiskaforbundet";
import { CitySelector } from "@/components/CitySelector";
import { PrayerTimes } from "@/components/PrayerTimes";
import { IOptionData } from "@/types/IOptionData";
import { PrayerTimesByDay } from "@/types/PrayerTimes";
import { DomUtils, parseDocument } from "htmlparser2";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface IPrayerTimeState {
  city: IOptionData;
  date: Date;
}

export default function Index() {
  const [cities, setCities] = useState<IOptionData[]>([
    { value: "Göteborg, SE", label: "Göteborg" },
  ]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesByDay>({});

  const [prayerTimeState, setPrayerTimeState] = useState<IPrayerTimeState>({
    city: { value: "", label: "" },
    date: new Date(),
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

  const updatePrayerTimes = async () => {
    const prayerTimes = await getPrayerTimesByDay({
      city: prayerTimeState.city.value,
      month: prayerTimeState.date.getMonth() + 1,
    });

    setPrayerTimes(prayerTimes);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    updatePrayerTimes();
  }, [prayerTimeState]);

  const todayPrayers = prayerTimes[prayerTimeState.date.getDate()];
  console.log(
    `City: ${
      prayerTimeState.city.label
    }, Day: ${prayerTimeState.date.getDate()}`,
    todayPrayers
  );

  return (
    <View style={{ padding: 10 }}>
      <View style={{ marginBottom: 10, padding: 10, width: "100%" }}>
        <CitySelector cities={cities} />
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
          {prayerTimeState.date.toDateString()}
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

async function getPrayerTimesByDay(input: {
  city: string;
  month: number;
}): Promise<PrayerTimesByDay> {
  const html = await fetchPrayerTimes({
    city: input.city,
    month: input.month,
  });

  const dom = parseDocument(html);
  const tbody = DomUtils.findOne(
    (elem) =>
      elem.type === "tag" &&
      elem.name === "tbody" &&
      elem.attribs.id === "ifis_bonetider",
    dom.children
  );

  if (!tbody) {
    return {};
  }

  const rows = DomUtils.findAll(
    (elem) => elem.type === "tag" && elem.name === "tr",
    tbody.children
  );

  const result: PrayerTimesByDay = {};
  rows.forEach((row) => {
    const cells = DomUtils.findAll(
      (elem) => elem.type === "tag" && elem.name === "td",
      row.children
    );

    if (cells.length === 7) {
      const day = parseInt(DomUtils.textContent(cells[0]), 10);

      result[day] = {
        fajr: DomUtils.textContent(cells[1]).trim(),
        shuruk: DomUtils.textContent(cells[2]).trim(),
        dhuhr: DomUtils.textContent(cells[3]).trim(),
        asr: DomUtils.textContent(cells[4]).trim(),
        maghrib: DomUtils.textContent(cells[5]).trim(),
        isha: DomUtils.textContent(cells[6]).trim(),
      };
    }
  });

  return result;
}
