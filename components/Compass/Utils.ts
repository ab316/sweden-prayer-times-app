import * as geolib from "geolib";
import { ICoodinates } from "@/types/ICoordinates";

export const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

export const getBearing = (user: ICoodinates, destination: ICoodinates) => {
  const bearing = geolib.getGreatCircleBearing(
    { latitude: user.lat, longitude: user.lon },
    { latitude: destination.lat, longitude: destination.lon }
  );
  return bearing;
};

// Function to interpolate between two colors with non-linear mapping
export const interpolateColor = (
  difference: number,
  maxDifference: number,
  margin: number
): string => {
  if (difference <= margin) {
    return "rgb(0,255,0)"; // Max green within the margin
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

  return `rgb(${r},${g},${b})`;
};

// Easing function to make changes rapid near 0
const easingFunction = (t: number) => t * t; // Quadratic easing
