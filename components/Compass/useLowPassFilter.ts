import { useRef } from "react";

/**
 * A custom hook that implements a low-pass filter to smooth noisy data.
 * @param {number} alpha - The smoothing factor (0 < alpha <= 1). Closer to 0 provides more smoothing.
 * @returns {function(number): number} - A function that takes a new value and returns the smoothed value.
 */
export const useLowPassFilter = (alpha: number) => {
  if (alpha <= 0 || alpha > 1) {
    throw new Error("Alpha must be between 0 and 1 (exclusive).");
  }

  const previousValue = useRef<number | null>(null);

  return (newValue: number): number => {
    if (previousValue.current === null) {
      // Initialize with the first value
      previousValue.current = newValue;
    } else {
      // Apply low-pass filter formula
      previousValue.current =
        previousValue.current + alpha * (newValue - previousValue.current);
    }

    return previousValue.current;
  };
};
