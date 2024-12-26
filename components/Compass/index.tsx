import * as Location from "expo-location";

import { ThemedView } from "@/components/ui";
import { ICoodinates } from "@/types/ICoordinates";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Button,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getBearing, interpolateColor, normalizeAngle } from "./Utils";
import { useAnimatedRotation } from "./useAnimatedRotation";
import { useLowPassFilter } from "./useLowPassFilter";

export interface ICompassProps {
  destination: ICoodinates;
  targetImage: ImageSourcePropType;
  errorMargin?: number;
  onBearingChange?: (
    bearing: number,
    heading: number,
    isFacingTarget: boolean
  ) => void;
}

const DEFAULT_ERROR_MARGIN = 3;
const FILTER_ALPHA = 0.1;

const Compass = ({
  destination,
  errorMargin: inErrorMargin,
  targetImage,
  onBearingChange,
}: ICompassProps) => {
  const errorMargin = inErrorMargin ?? DEFAULT_ERROR_MARGIN;

  const [error, setError] = useState<string | null>(null);
  const [userHeading, setUserHeading] = useState(0);

  const lpfLat = useLowPassFilter(FILTER_ALPHA);
  const lpfLon = useLowPassFilter(FILTER_ALPHA);
  const lpfHeading = useLowPassFilter(FILTER_ALPHA);
  const lpfDifference = useLowPassFilter(FILTER_ALPHA);

  const [needleTint, setNeedleTint] = useState("rgba(255, 0, 0, 0.3)");
  const [smoothedLocation, setSmoothedLocation] = useState<ICoodinates | null>(
    null
  );

  const needle = useAnimatedRotation();
  const target = useAnimatedRotation();

  const onLocationChange = (location: Location.LocationObject) => {
    const smoothedLat = lpfLat(location.coords.latitude);
    const smoothedLon = lpfLon(location.coords.longitude);

    setSmoothedLocation({ lat: smoothedLat, lon: smoothedLon });
  };

  const onHeadingChange = (heading: Location.LocationHeadingObject) => {
    const smoothedHeading = lpfHeading(heading.trueHeading);
    setUserHeading(smoothedHeading);
  };

  const retryPermissions = async () => {
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied.");
        return;
      }

      let locationSub: Location.LocationSubscription | undefined;
      let headingSub: Location.LocationSubscription | undefined;
      try {
        const [currLocation, currHeading] = await Promise.all([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Lowest,
            distanceInterval: 0,
          }),
          Location.getHeadingAsync(),
        ]);

        await Promise.all([
          onLocationChange(currLocation),
          onHeadingChange(currHeading),
        ]);

        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 0,
          },
          (location) => {
            onLocationChange(location);
          }
        );

        headingSub = await Location.watchHeadingAsync((heading) => {
          onHeadingChange(heading);
        });
      } catch {
        setError("Error initializing location or heading listeners.");
      }

      return () => {
        locationSub?.remove();
        headingSub?.remove();
      };
    } catch {
      setError("Unexpected error occurred while requesting permissions.");
    }
  };

  useEffect(() => {
    retryPermissions();
  }, []);

  useEffect(() => {
    if (smoothedLocation) {
      const bearing = normalizeAngle(getBearing(smoothedLocation, destination));

      const headingDiff = Math.abs(userHeading - bearing);
      const normalizedDiff =
        headingDiff > 180 ? 360 - headingDiff : headingDiff;
      const lpfDiff = lpfDifference(normalizedDiff);

      needle.updateRotation(bearing, userHeading);
      target.updateRotation(
        getBearing(smoothedLocation ?? { lat: 0, lon: 0 }, destination),
        userHeading
      );

      const colorRgb = interpolateColor(lpfDiff, errorMargin * 3, errorMargin);
      const color = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, 0.3)`;
      setNeedleTint(color);

      if (onBearingChange) {
        const isFacingTarget = lpfDiff <= errorMargin;
        onBearingChange(bearing, userHeading, isFacingTarget);
      }
    }
  }, [
    userHeading,
    smoothedLocation,
    destination,
    inErrorMargin,
    onBearingChange,
  ]);

  if (error) {
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={retryPermissions} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.compassContainer}>
      <View style={styles.outerContainer}>
        <Animated.View
          style={{ transform: [{ rotate: needle.interpolatedRotation }] }}
        >
          <View style={styles.rotatingContainer}>
            <Image
              source={require("../../assets/images/compass.png")}
              style={styles.compassImage}
            />

            {/* Target image */}
            <Animated.View
              style={{
                position: "absolute",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ rotate: target.interpolatedRotation }],
              }}
            >
              <Image
                source={targetImage}
                style={[
                  styles.targetImage,
                  { top: -150 }, // Position it outside the compass
                ]}
              />
            </Animated.View>

            {/* Needle */}
            <View style={styles.needleContainer}>
              <Image
                source={require("../../assets/images/needle.png")}
                style={styles.needleImage}
              />

              <Image
                source={require("../../assets/images/needle.png")}
                style={[
                  styles.needleImage,
                  {
                    tintColor: needleTint,
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      </View>
      <ThemedView style={styles.decorativeRing}>
        <Image
          source={require("../../assets/images/decorative_border.png")}
          style={styles.ringImage}
        />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
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

  outerContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  rotatingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  needleContainer: {
    position: "absolute",
    top: -95,
    left: 10,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  compassImage: {
    width: 300,
    height: 300,
  },
  targetImage: {
    width: 50,
    height: 50,
  },
  needleImage: {
    position: "absolute",
    width: 200,
    height: 200,
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

  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default Compass;
