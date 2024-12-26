import Compass from "@/components/Compass";
import { ThemedText, ThemedView } from "@/components/ui";
import { MAKKAH_COORDINATES } from "@/constants/Coordinates";
import { useTheme } from "@/hooks/ui";
import { useEffect, useReducer, useState } from "react";
import { Image, StyleSheet, Vibration, View } from "react-native";

export default function Tab() {
  const theme = useTheme();
  const [bearing, setBearing] = useState(0);
  const [heading, setHeading] = useState(0);
  const [facingQiblaState, dispatchFacingQibla] = useReducer(
    qiblaReducer,
    initialQiblaReducerState
  );

  useEffect(() => {
    if (facingQiblaState.isFacingQibla) {
      Vibration.vibrate(100);
    }
  }, [facingQiblaState]);

  return (
    <View style={[styles.container]}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/kaabah.png")}
          style={styles.kaabahImage}
        />
      </View>
      <ThemedText style={[styles.title, { color: theme.primaryText }]}>
        Qibla Finder
      </ThemedText>
      <ThemedText style={[styles.text, { color: theme.primaryText }]}>
        Qibla Direction: {Math.round(bearing)}°
      </ThemedText>
      <ThemedText style={[styles.text, { color: theme.primaryText }]}>
        Your Heading: {Math.round(heading)}°
      </ThemedText>

      <ThemedView
        style={[styles.statusContainer, { backgroundColor: theme.background }]}
      >
        <ThemedText
          style={[
            styles.text,
            styles.qiblaStatus,
            {
              color: facingQiblaState.isFacingQibla
                ? theme.accent
                : theme.secondaryText,
              textAlign: "center",
            },
          ]}
        >
          {facingQiblaState.isFacingQibla
            ? "You are facing the Qibla"
            : "Keep rotating the phone"}
        </ThemedText>
      </ThemedView>
      <Compass
        destination={MAKKAH_COORDINATES}
        targetImage={require("../../assets/images/kaabah.png")}
        errorMargin={3}
        onBearingChange={(bearing, heading, isFacingQibla) => {
          setBearing(bearing);
          setHeading(heading);
          dispatchFacingQibla(isFacingQibla);
        }}
      />
    </View>
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  text: {
    fontSize: 16,
    marginVertical: 0,
    textAlign: "center",
  },
  qiblaStatus: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
  },
  statusContainer: {
    borderRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginTop: 15,
    marginBottom: 20,
    width: "90%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

type IQibaReducerState = {
  isFacingQibla: boolean;
  prevIsFacingQibla: boolean;
};

const initialQiblaReducerState: IQibaReducerState = {
  isFacingQibla: false,
  prevIsFacingQibla: false,
};

function qiblaReducer(state: IQibaReducerState, action: boolean) {
  if (action === state.isFacingQibla) {
    return state;
  } else {
    return {
      isFacingQibla: action,
      prevIsFacingQibla: state.isFacingQibla,
    };
  }
}
