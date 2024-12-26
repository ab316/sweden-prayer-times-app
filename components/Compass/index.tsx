import * as Location from "expo-location";

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

  const lowPassFilterDifference = useLowPassFilter(FILTER_ALPHA);
  const lowPassFilterHeading = useLowPassFilter(FILTER_ALPHA);
  const lowPassFilterLocationLat = useLowPassFilter(FILTER_ALPHA);
  const lowPassFilterLocationLon = useLowPassFilter(FILTER_ALPHA);

  const [needleColor, setCompassColor] = useState("rgba(255, 0, 0, 0.3)");
  const [smoothedLocation, setSmoothedLocation] = useState<ICoodinates | null>(
    null
  );

  const needle = useAnimatedRotation();
  const target = useAnimatedRotation();

  const onLocationChange = (location: Location.LocationObject) => {
    const smoothedLat = lowPassFilterLocationLat(location.coords.latitude);
    const smoothedLon = lowPassFilterLocationLon(location.coords.longitude);

    setSmoothedLocation({ lat: smoothedLat, lon: smoothedLon });
  };

  const onHeadingChange = (heading: Location.LocationHeadingObject) => {
    const smoothedHeading = lowPassFilterHeading(heading.trueHeading);
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
      const lpfDiff = lowPassFilterDifference(normalizedDiff);

      needle.updateRotation(bearing, userHeading);
      target.updateRotation(
        getBearing(smoothedLocation ?? { lat: 0, lon: 0 }, destination),
        userHeading
      );

      const colorRgb = interpolateColor(lpfDiff, errorMargin * 2, errorMargin);
      const color = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, 0.3)`;
      setCompassColor(color);

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
    <View style={styles.outerContainer}>
      <Animated.View
        style={{ transform: [{ rotate: needle.interpolatedRotation }] }}
      >
        <View style={styles.rotatingContainer}>
          <Image
            source={require("../../assets/images/compass2.png")}
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
                  tintColor: needleColor,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
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

  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default Compass;
