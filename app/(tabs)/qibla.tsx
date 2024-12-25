import Compass from "@/components/Compass";
import { MAKKAH_COORDINATES } from "@/constants/Coordinates";
import { useState } from "react";
import { StyleSheet, View, Text } from "react-native";

export default function Tab() {
  const [bearing, setBearing] = useState(0);
  const [heading, setHeading] = useState(0);
  const [isFacingQibla, setIsFacingQibla] = useState(false);

  return (
    <View style={styles.container}>
      <Text>Qiba direction: {Math.round(bearing)}°</Text>
      <Text>Heading: {Math.round(heading)}°</Text>
      <Text>Is facing Qibla: {isFacingQibla ? "Yes" : "No"}</Text>
      <Compass
        destination={MAKKAH_COORDINATES}
        targetImage={require("../../assets/images/kaabah.png")}
        errorMargin={3}
        onBearingChange={(bearing, heading, isFacingQibla) => {
          setBearing(bearing);
          setHeading(heading);
          setIsFacingQibla(isFacingQibla);
        }}
      />
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
