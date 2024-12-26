import Compass from "@/components/Compass";
import { ThemedText, ThemedView } from "@/components/ui";
import { MAKKAH_COORDINATES } from "@/constants/Coordinates";
import { useTheme } from "@/hooks/ui";
import { useState } from "react";
import { StyleSheet, Image } from "react-native";

export default function Tab() {
  const theme = useTheme();
  const [bearing, setBearing] = useState(0);
  const [heading, setHeading] = useState(0);
  const [isFacingQibla, setIsFacingQibla] = useState(false);

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ThemedView style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/kaabah.png")}
          style={styles.kaabahImage}
        />
      </ThemedView>
      <ThemedText style={[styles.title, { color: theme.primaryText }]}>
        Qibla Finder
      </ThemedText>
      <ThemedText style={[styles.text, { color: theme.primaryText }]}>
        Qibla Direction: {Math.round(bearing)}°
      </ThemedText>
      <ThemedText style={[styles.text, { color: theme.primaryText }]}>
        Heading: {Math.round(heading)}°
      </ThemedText>
      <ThemedText
        style={[
          styles.text,
          styles.qiblaStatus,
          { color: isFacingQibla ? theme.accent : theme.secondaryText },
        ]}
      >
        {isFacingQibla ? "You are facing the Qibla" : "Keep rotating the phone"}
      </ThemedText>
      <ThemedView style={styles.compassContainer}>
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
        <ThemedView style={styles.decorativeRing}>
          <Image
            source={require("../../assets/images/decorative_border.png")}
            style={styles.ringImage}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    elevation: 5, // For shadow effect on Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#FFFFFF", // White background to avoid transparency issues
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 3, // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  kaabahImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: "center",
  },
  qiblaStatus: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 15,
  },
  compassContainer: {
    marginTop: 40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#F5F5F5", // Subtle background to make it stand out
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    position: "relative",
  },
  decorativeRing: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -5,
    left: -8,
    zIndex: -1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  ringImage: {
    width: 280,
    height: 280,
    resizeMode: "contain",
  },
});
