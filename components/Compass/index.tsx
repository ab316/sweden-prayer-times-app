import * as Location from "expo-location";

import { ICoodinates } from "@/types/ICoordinates";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { getBearing, interpolateColor } from "./Utils";

export interface ICompassProps {
  destination: ICoodinates;
  errorMargin?: number;
}

const Compass = ({
  destination,
  errorMargin: inErrorMargin,
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

        const headingDifference = Math.abs(userHeading - bearing);
        const normalizedDifference =
          headingDifference > 180 ? 360 - headingDifference : headingDifference;
        const maxDifference = 10;
        const errorMargin = inErrorMargin ?? 5;
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
        <View
          style={{ ...styles.arrow, borderBottomColor: needleColor }}
        ></View>
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
    backgroundColor: "#fff",
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
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default Compass;
