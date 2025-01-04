import { ThemedView } from "@/components/ui";
import { ICoodinates } from "@/types/ICoordinates";
import React from "react";
import {
  Animated,
  Button,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCompass } from "./useCompass";
import { IBearingChangeParams } from "./types";

export interface ICompassProps {
  destination: ICoodinates;
  targetImage: ImageSourcePropType;
  errorMargin?: number;
  onBearingChange?: (params: IBearingChangeParams) => void;
  onCalibrationNeeded?: (calibrationNeeded: boolean) => void;
}

const Compass = ({
  destination,
  errorMargin: inErrorMargin,
  targetImage,
  onBearingChange,
  onCalibrationNeeded,
}: ICompassProps) => {
  const { error, retryPermissions, needleTint, needle, target } = useCompass({
    destination,
    errorMargin: inErrorMargin,
    onBearingChange,
    onCalibrationNeeded,
  });

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
