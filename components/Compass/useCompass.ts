import * as Location from "expo-location";
import { ICoodinates } from "@/types/ICoordinates";
import { DeviceMotion, DeviceMotionMeasurement } from "expo-sensors";
import { useCallback, useEffect, useState } from "react";
import { useLowPassFilter } from "./useLowPassFilter";
import { useAnimatedRotation } from "./useAnimatedRotation";
import { getBearing, interpolateColor } from "./Utils";
import { useFocusEffect } from "expo-router";

export interface ICompassProps {
  destination: ICoodinates;
  errorMargin?: number;
  onBearingChange?: (
    bearing: number,
    heading: number,
    isFacingTarget: boolean
  ) => void;
}

const DEFAULT_ERROR_MARGIN = 3;
const FILTER_ALPHA = 0.1;

export const useCompass = ({
  destination,
  errorMargin: inErrorMargin,
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
      unsubscribe();

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

  const unsubscribe = () => {
    locationSub?.remove();
    headingSub?.remove();
    deviceMotionSub?.remove();
  };

  useFocusEffect(
    useCallback(() => {
      retryPermissions();

      return () => {
        unsubscribe();
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

  return { error, needleTint, needle, target, retryPermissions };
};
