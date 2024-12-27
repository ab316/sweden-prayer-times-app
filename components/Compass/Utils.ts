import * as geolib from "geolib";
import { ICoodinates } from "@/types/ICoordinates";

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

// Function to interpolate between two colors based on a difference
export const interpolateColor = (
  difference: number,
  maxDifference: number,
  margin: number
): {
  r: number;
  g: number;
  b: number;
} => {
  if (difference > maxDifference) {
    return { r: 255, g: 0, b: 0 };
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

  const result = { r, g, b };
  return result;
};

// Easing function to make changes rapid near 0
const easingFunction = (t: number) => t;
