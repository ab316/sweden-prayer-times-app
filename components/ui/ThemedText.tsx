import { Text, type TextProps, StyleSheet } from "react-native";

import { useThemeColor } from "@/hooks/ui/useThemeColor";
import { ColorTheme } from "@/types/ui/Colors";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "defaultBold"
    | "subtitle"
    | "link";
  variant?: "primary" | "secondary";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  variant = "primary",
  ...rest
}: ThemedTextProps) {
  let colorType: keyof ColorTheme =
    variant === "primary" ? "primaryText" : "secondaryText";

  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    colorType
  );

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "defaultBold" ? styles.defaultBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  defaultBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
