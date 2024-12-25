import { useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { normalizeRotationAngle } from "./Utils";

export function useAnimatedRotation(
  initialAngle: number = 0,
  errorMargin: number = 3
) {
  const [angle, setAngle] = useState(initialAngle);
  const rotation = useRef(new Animated.Value(initialAngle)).current;

  const updateRotation = (newAngle: number, userHeading: number) => {
    const { newAngle: normalizedAngle, delta } = normalizeRotationAngle(
      newAngle,
      userHeading,
      angle
    );

    if (Math.abs(delta) > errorMargin) {
      setAngle(normalizedAngle);
      Animated.timing(rotation, {
        toValue: normalizedAngle,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  };

  const interpolatedRotation = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return { angle, interpolatedRotation, updateRotation };
}
