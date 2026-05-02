import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { theme } from '@/constants/theme';

const TAB_BAR_CONTENT_HEIGHT = 68;
const TAB_ICON_SLOT_HEIGHT = 36;
const TAB_ICON_TOP_PADDING = 9;
const TAB_BAR_MIN_BOTTOM_PADDING = 12;

function ActiveIndicator() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        width: 32,
        height: 3,
        borderRadius: 2,
        backgroundColor: theme.primary,
      }}
    />
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        height: TAB_ICON_SLOT_HEIGHT,
        justifyContent: 'flex-end',
        paddingTop: TAB_ICON_TOP_PADDING,
      }}>
      {focused ? <ActiveIndicator /> : null}
      <MaterialIcons name={name} size={24} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_PADDING);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSub,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_600SemiBold',
          fontSize: 11,
          lineHeight: 16,
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: 'rgba(0,0,0,0.06)',
          borderTopWidth: 1,
          height: TAB_BAR_CONTENT_HEIGHT + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="schedule" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'Qibla',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="explore" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="info" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
