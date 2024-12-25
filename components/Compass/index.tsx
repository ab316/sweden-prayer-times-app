import * as Location from "expo-location";

import { ICoodinates } from "@/types/ICoordinates";
import React, { useEffect, useState } from "react";
import { Animated, Button, Image, StyleSheet, Text, View } from "react-native";
import { getBearing, interpolateColor, normalizeAngle } from "./Utils";
import { useAnimatedRotation } from "./useAnimatedRotation";
import { useLowPassFilter } from "./useLowPassFilter";

export interface ICompassProps {
  destination: ICoodinates;
  errorMargin?: number;
  onBearingChange?: (
    bearing: number,
    heading: number,
    isFacingQibla: boolean
  ) => void;
}

const DEFAULT_ERROR_MARGIN = 3;
const FILTER_ALPHA = 0.1;

const Compass = ({
  destination,
  errorMargin: inErrorMargin,
  onBearingChange,
}: ICompassProps) => {
  const [error, setError] = useState<string | null>(null);
  const [userHeading, setUserHeading] = useState(0);

  const lowPassFilterHeading = useLowPassFilter(FILTER_ALPHA);
  const lowPassFilterLocationLat = useLowPassFilter(FILTER_ALPHA);
  const lowPassFilterLocationLon = useLowPassFilter(FILTER_ALPHA);

  const [needleColor, setCompassColor] = useState("#f00");
  const [smoothedLocation, setSmoothedLocation] = useState<ICoodinates | null>(
    null
  );

  const needle = useAnimatedRotation();
  const kaabah = useAnimatedRotation();

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
        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 0,
          },
          (location) => {
            const smoothedLat = lowPassFilterLocationLat(
              location.coords.latitude
            );
            const smoothedLon = lowPassFilterLocationLon(
              location.coords.longitude
            );
            setSmoothedLocation({ lat: smoothedLat, lon: smoothedLon });
          }
        );

        headingSub = await Location.watchHeadingAsync((heading) => {
          const smoothedHeading = lowPassFilterHeading(heading.trueHeading);
          setUserHeading(smoothedHeading);
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

      const headingDifference = Math.abs(userHeading - bearing);
      const normalizedDifference =
        headingDifference > 180 ? 360 - headingDifference : headingDifference;
      const errorMargin = inErrorMargin ?? DEFAULT_ERROR_MARGIN;

      if (onBearingChange) {
        const isFacingQibla = normalizedDifference <= errorMargin;
        onBearingChange(bearing, userHeading, isFacingQibla);
      }

      needle.updateRotation(bearing, userHeading);
      kaabah.updateRotation(
        getBearing(smoothedLocation ?? { lat: 0, lon: 0 }, destination),
        userHeading
      );

      const color = interpolateColor(
        normalizedDifference,
        errorMargin * 2,
        errorMargin
      );
      setCompassColor(color);
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
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={retryPermissions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ transform: [{ rotate: needle.interpolatedRotation }] }}
      >
        <View style={styles.needleContainer}>
          <Image
            source={require("../../assets/images/compass.png")}
            style={styles.compassImage}
          />
          <Animated.View
            style={{
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              transform: [{ rotate: kaabah.interpolatedRotation }],
            }}
          >
            <Image
              source={require("../../assets/images/kaabah.png")}
              style={[
                styles.kaabahImage,
                { top: -150 }, // Position it outside the compass
              ]}
            />
          </Animated.View>
          <View style={styles.arrowContainer}>
            <View style={{ ...styles.arrow, borderBottomColor: needleColor }} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  arrowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 60,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "red",
  },
  compassImage: {
    width: 300,
    height: 300,
  },
  needleContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  kaabahContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  kaabahImage: {
    width: 50,
    height: 50,
  },
});

export default Compass;
