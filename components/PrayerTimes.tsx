import { ThemedText, ThemedView } from "@/components/ui";
import { useTheme } from "@/hooks/ui";
import { IPrayerTimes } from "@/types/PrayerTimes";
import { StyleSheet } from "react-native";

export const PrayerTimes = ({ times }: { times: IPrayerTimes }) => {
  const theme = useTheme();
  return (
    <ThemedView
      style={[styles.container, { backgroundColor: theme.highlight }]}
    >
      <Header />
      <ThemedView
        style={[styles.tableContainer, { backgroundColor: theme.accent }]}
      >
        <PrayerTime name="Fajr" time={times.fajr} />
        <PrayerTime name="Shuruk" time={times.shuruk} />
        <PrayerTime name="Dhuhr" time={times.dhuhr} />
        <PrayerTime name="Asr" time={times.asr} />
        <PrayerTime name="Maghrib" time={times.maghrib} />
        <PrayerTime name="Isha" time={times.isha} />
      </ThemedView>
    </ThemedView>
  );
};

const Header = () => {
  return (
    <ThemedView style={[styles.row]}>
      <ThemedText style={styles.header}>Prayer</ThemedText>
      <ThemedText style={styles.header}>Time</ThemedText>
    </ThemedView>
  );
};

const PrayerTime = ({ name, time }: { name: string; time: string }) => {
  const theme = useTheme();
  return (
    <ThemedView style={[styles.row, { backgroundColor: theme.accent }]}>
      <ThemedText style={styles.label}>{name}</ThemedText>
      <ThemedText style={styles.label}>{time}</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
  },
  tableContainer: {
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 5,
  },
  header: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    flex: 1,
    textAlign: "center",
  },
});
