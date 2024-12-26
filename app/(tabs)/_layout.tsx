import { ThemedText, ThemedView } from "@/components/ui";
import { useTheme } from "@/hooks/ui";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: theme.background,
        tabBarInactiveBackgroundColor: theme.accent,
        tabBarActiveTintColor: theme.primaryText,
        tabBarInactiveTintColor: theme.primaryText,
        headerShown: false,
        header: ({ options }) => (
          <ThemedView
            style={[styles.tabContainer, { backgroundColor: theme.accent }]}
          >
            <ThemedText variant="primary">{options.title}</ThemedText>
          </ThemedView>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Prayer Times",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={theme.primaryText} />
          ),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: "Qibla",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="compass" color={theme.primaryText} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="question" color={theme.primaryText} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    padding: 15,
    paddingVertical: 10,
  },
});
