import * as Location from "expo-location";
import { DeviceMotion, DeviceMotionMeasurement } from "expo-sensors";

import { ThemedView } from "@/components/ui";
import { ICoodinates } from "@/types/ICoordinates";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Button,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getBearing, interpolateColor } from "./Utils";
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

  let locationSub: Location.LocationSubscription | undefined;
  let headingSub: Location.LocationSubscription | undefined;
  let deviceMotionSub: ReturnType<typeof DeviceMotion.addListener> | undefined;

  const [error, setError] = useState<string | null>(null);
  const [deviceMotion, setDeviceMotion] =
    useState<DeviceMotionMeasurement | null>(null);

  const lpfLat = useLowPassFilter(FILTER_ALPHA);
  const lpfLon = useLowPassFilter(FILTER_ALPHA);
  const [smoothedLocation, setSmoothedLocation] = useState<ICoodinates | null>(
    null
  );

  const needle = useAnimatedRotation();
  const target = useAnimatedRotation();
  const [needleTint, setNeedleTint] = useState("rgba(255, 0, 0, 0.3)");

  const onLocationChange = (location: Location.LocationObject) => {
    const smoothedLat = lpfLat(location.coords.latitude);
    const smoothedLon = lpfLon(location.coords.longitude);
    setSmoothedLocation({ lat: smoothedLat, lon: smoothedLon });
  };

  const retryPermissions = async () => {
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied.");
        return;
      }

      const { granted: deviceMotionGranted } =
        await DeviceMotion.requestPermissionsAsync();
      if (!deviceMotionGranted) {
        setError("Permission to access device motion was denied.");
        return;
      }

      try {
        DeviceMotion.setUpdateInterval(10);

        deviceMotionSub = DeviceMotion.addListener((measurement) => {
          setDeviceMotion(measurement);
        });

        const currLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
          distanceInterval: 0,
        });

        onLocationChange(currLocation);

        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 0,
          },
          (location) => {
            onLocationChange(location);
          }
        );
      } catch {
        setError("Error initializing location or heading listeners.");
      }
    } catch {
      setError("Unexpected error occurred while requesting permissions.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      retryPermissions();

      return () => {
        locationSub?.remove();
        headingSub?.remove();
        deviceMotionSub?.remove();
      };
    }, [])
  );

  useEffect(() => {
    if (smoothedLocation) {
      const bearing = getBearing(smoothedLocation, destination);

      const headingRadians = deviceMotion?.rotation?.alpha ?? 0;
      const headingDegrees = headingRadians * (180 / Math.PI);
      const correctedHeading = (360 - headingDegrees) % 360;

      const diff = Math.abs(correctedHeading - bearing);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;

      needle.updateRotation(bearing, correctedHeading);
      target.updateRotation(bearing, correctedHeading);

      const colorRgb = interpolateColor(
        normalizedDiff,
        errorMargin * 3,
        errorMargin
      );
      const color = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, 0.3)`;
      setNeedleTint(color);

      if (onBearingChange) {
        const isFacingTarget = normalizedDiff <= errorMargin;
        onBearingChange(bearing, correctedHeading, isFacingTarget);
      }
    }
  }, [
    deviceMotion,
    smoothedLocation,
    destination,
    inErrorMargin,
    onBearingChange,
    needle,
    target,
    errorMargin,
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
              source={require("../../assets/images/compass/compass.png")}
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
                source={require("../../assets/images/compass/needle.png")}
                style={styles.needleImage}
              />

              <Image
                source={require("../../assets/images/compass/needle.png")}
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

        {/* Decorative ring */}
        <ThemedView style={styles.decorativeRing}>
          <Image
            source={require("../../assets/images/compass/decorative_border.png")}
            style={styles.ringImage}
          />
        </ThemedView>
      </View>
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
    left: -9,
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
