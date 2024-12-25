import Compass from "@/components/Compass";
import { MAKKAH_COORDINATES } from "@/constants/Coordinates";
import { StyleSheet, View } from "react-native";

export default function Tab() {
  return (
    <View style={styles.container}>
      <Compass destination={MAKKAH_COORDINATES} />
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
