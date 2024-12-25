/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { ColorsType } from "@/types/ui/Colors";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors: ColorsType = {
  light: {
    background: "#E8F5E9", // Light green background
    primaryText: "#2E7D32", // Islamic green
    secondaryText: "#1B5E20", // Dark green
    accent: "#A5D6A7", // Light green for dropdowns and other accents
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    background: "#1B5E20", // Dark green background
    primaryText: "#E8F5E9", // Light green text
    secondaryText: "#A5D6A7", // Light green accents
    accent: "#34A853", // Bright green for highlights
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
