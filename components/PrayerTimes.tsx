import { IPrayerTimes } from "@/types/PrayerTimes";
import { StyleSheet, Text, View } from "react-native";

export const PrayerTimes = ({ times }: { times: IPrayerTimes }) => {
  return (
    <View style={styles.container}>
      <Header />
      <PrayerTime name="Fajr" time={times.fajr} />
      <PrayerTime name="Shuruk" time={times.shuruk} />
      <PrayerTime name="Dhuhr" time={times.dhuhr} />
      <PrayerTime name="Asr" time={times.asr} />
      <PrayerTime name="Maghrib" time={times.maghrib} />
      <PrayerTime name="Isha" time={times.isha} />
    </View>
  );
};

const Header = () => {
  return (
    <View style={styles.row}>
      <Text style={styles.header}>Prayer</Text>
      <Text style={styles.header}>Time</Text>
    </View>
  );
};

const PrayerTime = ({ name, time }: { name: string; time: string }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{name}</Text>
      <Text style={styles.label}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#A5D6A7", // Light green
    padding: 10,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1B5E20", // Dark green
  },
  label: {
    flex: 1,
    textAlign: "center",
    color: "#2E7D32", // Islamic green
  },
});
