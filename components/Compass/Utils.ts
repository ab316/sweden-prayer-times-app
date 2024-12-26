import * as geolib from "geolib";
import { ICoodinates } from "@/types/ICoordinates";

/**
 * Normalize an angle to be within 0-360 degrees.
 */
export const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

export const getBearing = (user: ICoodinates, destination: ICoodinates) => {
  const bearing = geolib.getGreatCircleBearing(
    { latitude: user.lat, longitude: user.lon },
    { latitude: destination.lat, longitude: destination.lon }
  );
  return bearing;
};

export const normalizeRotationAngle = (
  destinationHeading: number,
  currentHeading: number,
  currentAngle: number
) => {
  let newAngle = destinationHeading - currentHeading;
  let delta = newAngle - currentAngle;
  while (delta > 180 || delta < -180) {
    if (delta > 180) {
      newAngle -= 360;
    } else if (delta < -180) {
      newAngle += 360;
    }
    delta = newAngle - currentAngle;
  }
  return { newAngle, delta };
};

// Function to interpolate between two colors with non-linear mapping
export const interpolateColor = (
  difference: number,
  maxDifference: number,
  margin: number
): {
  r: number;
  g: number;
  b: number;
} => {
  if (difference <= margin) {
    return { r: 255, g: 0, b: 0 }; // Max red within the margin
  }

  // Normalize the difference between margin and maxDifference
  const clampedDifference = Math.min(
    Math.max(difference - margin, 0),
    maxDifference - margin
  );
  const normalized = clampedDifference / (maxDifference - margin);

  // Apply easing function
  const eased = easingFunction(normalized);

  // Interpolate colors
  const r = Math.round(255 * eased); // Red increases
  const g = Math.round(255 * (1 - eased)); // Green decreases
  const b = Math.round(200 * eased); // Add blue for a gradient effect

  return { r, g, b };
};

// Easing function to make changes rapid near 0
const easingFunction = (t: number) => t * t; // Quadratic easing
