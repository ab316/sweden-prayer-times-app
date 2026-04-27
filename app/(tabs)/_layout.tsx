import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

const ACTIVE_TINT = '#775a19';
const INACTIVE_TINT = '#707974';
const TAB_BAR_BG = '#ffffff';
const TAB_BAR_BORDER = '#bfc9c3';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: ACTIVE_TINT,
        tabBarInactiveTintColor: INACTIVE_TINT,
        tabBarLabelStyle: {
          fontFamily: 'Manrope_500Medium',
          fontSize: 11,
          letterSpacing: -0.1,
        },
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopColor: TAB_BAR_BORDER,
          borderTopWidth: 0.5,
          height: 72,
          paddingTop: 8,
          paddingBottom: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="schedule" size={24} color={color} style={{ opacity: focused ? 1 : 0.85 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'Qibla',
          tabBarIcon: ({ color }) => <MaterialIcons name="explore" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <MaterialIcons name="info" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
