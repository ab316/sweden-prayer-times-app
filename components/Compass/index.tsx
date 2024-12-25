import * as Location from "expo-location";

import { ICoodinates } from "@/types/ICoordinates";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getBearing, interpolateColor, normalizeAngle } from "./Utils";
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

const Compass = ({
  destination,
  errorMargin: inErrorMargin,
  onBearingChange,
}: ICompassProps) => {
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [userHeading, setUserHeading] = useState(0);
  const [angle, setAngle] = useState<number>(0);
  const rotation = useRef(new Animated.Value(0)).current;
  const lowPassFilter = useLowPassFilter(0.1);

  const [needleColor, setCompassColor] = useState("#f00");

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
            setUserLocation(location);
          }
        );

        headingSub = await Location.watchHeadingAsync((heading) => {
          const smoothedHeading = lowPassFilter(heading.trueHeading);
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
    const rotateImage = (angle: number) => {
      Animated.timing(rotation, {
        toValue: angle,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    };

    if (userLocation) {
      const bearing = normalizeAngle(
        getBearing(
          {
            lat: userLocation.coords.latitude,
            lon: userLocation.coords.longitude,
          },
          destination
        )
      );

      const headingDifference = Math.abs(userHeading - bearing);
      const normalizedDifference =
        headingDifference > 180 ? 360 - headingDifference : headingDifference;
      const errorMargin = inErrorMargin ?? DEFAULT_ERROR_MARGIN;
      const maxDifference = errorMargin * 2;

      if (onBearingChange) {
        const isFacingQibla = normalizedDifference <= errorMargin;
        onBearingChange(bearing, userHeading, isFacingQibla);
      }

      let newAngle = bearing - userHeading;
      let delta = newAngle - angle;
      while (delta > 180 || delta < -180) {
        if (delta > 180) {
          newAngle -= 360;
        } else if (delta < -180) {
          newAngle += 360;
        }
        delta = newAngle - angle;
      }
      if (Math.abs(delta) > 5) {
        setAngle(newAngle);
        rotateImage(newAngle);
      }

      const color = interpolateColor(
        normalizedDifference,
        maxDifference,
        errorMargin
      );
      setCompassColor(color);
    }
  }, [userHeading, userLocation, destination, inErrorMargin, onBearingChange]);

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
        style={{
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 360],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        }}
      >
        <View style={styles.needleContainer}>
          <Image
            source={require("../../assets/images/compass.png")}
            style={styles.compassImage}
          />
          <View style={styles.kaabahContainer}>
            <Image
              source={require("../../assets/images/kaabah.png")}
              style={styles.kaabahImage}
            />
          </View>
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
    top: -30,
    justifyContent: "center",
    alignItems: "center",
  },
  kaabahImage: {
    width: 50,
    height: 50,
  },
});

export default Compass;
