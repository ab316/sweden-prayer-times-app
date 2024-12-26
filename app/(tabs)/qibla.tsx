import Compass from "@/components/Compass";
import { ThemedText, ThemedView } from "@/components/ui";
import { MAKKAH_COORDINATES } from "@/constants/Coordinates";
import { useTheme } from "@/hooks/ui";
import { useState } from "react";
import { StyleSheet } from "react-native";

export default function Tab() {
  const theme = useTheme();
  const [bearing, setBearing] = useState(0);
  const [heading, setHeading] = useState(0);
  const [isFacingQibla, setIsFacingQibla] = useState(false);

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: theme.primaryText }]}
    >
      <ThemedText variant="secondary">
        Qiba direction: {Math.round(bearing)}°
      </ThemedText>
      <ThemedText variant="secondary">
        Heading: {Math.round(heading)}°
      </ThemedText>
      <ThemedText variant="secondary">
        Is facing Qibla: {isFacingQibla ? "Yes" : "No"}
      </ThemedText>
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
    </ThemedView>
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
