import { IOptionData } from "@/types/IOptionData";
import { IPrayerTimes } from "@/types/PrayerTimes";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";

export const PrayerTimes = ({
  date,
  times,
}: {
  date: Date;
  times: IPrayerTimes;
}) => {
  return (
    <View style={styles.container}>
      <PrayerTime name="Fajr" time={times.fajr} />
      <PrayerTime name="Shuruk" time={times.shuruk} />
      <PrayerTime name="Dhuhr" time={times.dhuhr} />
      <PrayerTime name="Asr" time={times.asr} />
      <PrayerTime name="Maghrib" time={times.maghrib} />
      <PrayerTime name="Isha" time={times.isha} />
    </View>
  );
};

const PrayerTime = ({ name, time }: { name: string; time: string }) => {
  return (
    <View style={{ flexDirection: "row", marginBottom: 5, minWidth: 200 }}>
      <Text style={{ flex: 1 }}>{name}</Text>
      <Text style={{ flex: 1 }}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // flexDirection: "column",
    // justifyContent: "center",
    // paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {},
  selectedText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
});
