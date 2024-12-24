import Compass from "@/components/Compass";
import { View, Text, StyleSheet } from "react-native";

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>Qibla</Text>
      <Compass />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "blue",
    opacity: 1.0,
    justifyContent: "center",
    alignItems: "center",
  },
});
