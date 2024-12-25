import * as Location from "expo-location";

import { ICoodinates } from "@/types/ICoordinates";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View, Image } from "react-native";
import { getBearing, interpolateColor } from "./Utils";

export interface ICompassProps {
  destination: ICoodinates;
  errorMargin?: number;
  onBearingChange?: (
    bearing: number,
    heading: number,
    isFacingQibla: boolean
  ) => void;
}

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
  const [needleColor, setCompassColor] = useState("#f00");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied.");
        return;
      }

      const location = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 0,
        },
        (location) => {
          setUserLocation(location);
        }
      );

      const heading = await Location.watchHeadingAsync((heading) => {
        setUserHeading(heading.trueHeading);
      });

      return () => {
        location.remove();
        heading.remove();
      };
    })();
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

    const checkHeading = setTimeout(() => {
      if (userLocation) {
        const bearing = getBearing(
          {
            lat: userLocation.coords.latitude,
            lon: userLocation.coords.longitude,
          },
          destination
        );

        const headingDifference = Math.abs(userHeading - bearing);
        const normalizedDifference =
          headingDifference > 180 ? 360 - headingDifference : headingDifference;
        const errorMargin = inErrorMargin ?? 5;
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
    }, 0);

    return () => clearTimeout(checkHeading);
  }, [userHeading]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
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
    // backgroundColor: "#ff0",
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
    // flex: 0.6,
    // width: "100%",
    width: 300,
    height: 300,
  },
  needleContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  kaabahContainer: {
    position: "absolute",
    top: -30, // Adjust based on the needle tip
    justifyContent: "center",
    alignItems: "center",
  },
  kaabahImage: {
    // Image center on the compass
    // position: "absolute",
    // top: -35,
    // left: 125,
    width: 50,
    height: 50,
    // backgroundColor: "red",
  },
});

export default Compass;
