import Compass from "@/components/Compass";
import { MAKKAH_COORDINATES } from "@/constants/Coordinates";
import { useState } from "react";
import { StyleSheet, View, Text } from "react-native";

export default function Tab() {
  const [bearing, setBearing] = useState(0);

  return (
    <View style={styles.container}>
      <Text>Qiba direction: {Math.round(bearing)}°</Text>
      <Compass destination={MAKKAH_COORDINATES} onBearingChange={setBearing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "blue",
    // opacity: 1.0,
    justifyContent: "center",
    alignItems: "center",
  },
});
