import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/ui/useColorScheme";

export function useTheme() {
  const theme = useColorScheme() ?? "light";
  return Colors[theme];
}
