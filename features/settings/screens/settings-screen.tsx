import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PrayerAlert = {
  key: string;
  name: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  enabled: boolean;
};

type AlertRowProps = {
  item: PrayerAlert;
  last?: boolean;
  onToggle: (key: string) => void;
};

type SystemToggleRowProps = {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  value: boolean;
  onValueChange: () => void;
};

const INITIAL_ALERTS: PrayerAlert[] = [
  {
    key: 'fajr',
    name: 'Fajr',
    description: 'Adhan & 15m pre-alert',
    icon: 'wb-twilight',
    enabled: true,
  },
  {
    key: 'dhuhr',
    name: 'Dhuhr',
    description: 'Adhan only',
    icon: 'light-mode',
    enabled: true,
  },
  {
    key: 'asr',
    name: 'Asr',
    description: 'Adhan only',
    icon: 'sunny-snowing',
    enabled: true,
  },
  {
    key: 'maghrib',
    name: 'Maghrib',
    description: 'Adhan & 10m pre-alert',
    icon: 'wb-twilight',
    enabled: true,
  },
  {
    key: 'isha',
    name: 'Isha',
    description: 'Silent',
    icon: 'nightlight',
    enabled: false,
  },
];

const COLORS = {
  primary: '#003527',
  secondary: '#775a19',
  outline: '#707974',
  surfaceVariant: '#e2e3e0',
  onPrimary: '#ffffff',
};

function SettingsSwitch({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Switch
      accessibilityLabel={accessibilityLabel}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.surfaceVariant, true: COLORS.primary }}
      thumbColor={COLORS.onPrimary}
      ios_backgroundColor={COLORS.surfaceVariant}
    />
  );
}

function AlertRow({ item, last, onToggle }: AlertRowProps) {
  return (
    <View
      className={`flex-row items-center justify-between gap-4 bg-surface-container-lowest/50 p-gutter ${
        last ? '' : 'border-b border-outline-variant/20'
      }`}>
      <View className="min-w-0 flex-1 flex-row items-center gap-element-gap">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
          <MaterialIcons name={item.icon} size={22} color={COLORS.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-body-lg text-body-lg font-semibold text-on-surface">{item.name}</Text>
          <Text className="font-body-md text-sm text-on-surface-variant">{item.description}</Text>
        </View>
      </View>
      <SettingsSwitch
        accessibilityLabel={`${item.name} prayer alert`}
        value={item.enabled}
        onValueChange={() => onToggle(item.key)}
      />
    </View>
  );
}

function SystemToggleRow({
  title,
  description,
  icon,
  value,
  onValueChange,
}: SystemToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-4 border-b border-outline-variant/20 p-gutter">
      <View className="min-w-0 flex-1 flex-row items-center gap-element-gap">
        <MaterialIcons name={icon} size={24} color={COLORS.outline} />
        <View className="min-w-0 flex-1">
          <Text className="font-body-lg text-body-lg font-medium text-on-surface">{title}</Text>
          <Text className="font-body-md text-sm text-on-surface-variant">{description}</Text>
        </View>
      </View>
      <SettingsSwitch
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [globalNotifications, setGlobalNotifications] = useState(true);

  const toggleAlert = (key: string) => {
    setAlerts((current) =>
      current.map((item) => (item.key === key ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-outline-variant/50 bg-surface px-6 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change location"
          onPress={() => router.push('/select-city')}
          className="rounded-full p-2">
          <MaterialIcons name="location-on" size={24} color={COLORS.primary} />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-primary">Sakinah Bloom</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open about"
          onPress={() => router.push('/about')}
          className="rounded-full p-2">
          <MaterialIcons name="account-circle" size={24} color={COLORS.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-container-padding pt-section-gap pb-28"
        className="flex-1">
        <View className="w-full max-w-3xl self-center">
          <View className="mb-section-gap pt-unit">
            <Text className="mb-element-gap font-headline-xl text-headline-xl text-primary">
              Settings
            </Text>
            <Text className="font-body-lg text-body-lg text-on-surface-variant">
              Manage your notifications, location, and application preferences.
            </Text>
          </View>

          <View className="mb-section-gap">
            <Text className="mb-container-padding font-headline-md text-headline-md text-primary">
              Prayer Alerts
            </Text>
            <View
              className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }}>
              {alerts.map((item, index) => (
                <AlertRow
                  key={item.key}
                  item={item}
                  last={index === alerts.length - 1}
                  onToggle={toggleAlert}
                />
              ))}
            </View>
          </View>

          <View className="mb-section-gap">
            <Text className="mb-container-padding font-headline-md text-headline-md text-primary">
              System
            </Text>
            <View
              className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }}>
              <SystemToggleRow
                title="Global Notifications"
                description="Enable or disable all app alerts"
                icon="notifications-active"
                value={globalNotifications}
                onValueChange={() => setGlobalNotifications((value) => !value)}
              />
              <View className="flex-row items-center justify-between gap-4 p-gutter">
                <View className="min-w-0 flex-1 flex-row items-center gap-element-gap">
                  <MaterialIcons name="cached" size={24} color={COLORS.outline} />
                  <View className="min-w-0 flex-1">
                    <Text className="font-body-lg text-body-lg font-medium text-on-surface">
                      Clear Cached Times
                    </Text>
                    <Text className="font-body-md text-sm text-on-surface-variant">
                      Force refresh calculation data
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear cached times"
                  onPress={() =>
                    Alert.alert('Cache unchanged', 'Cached prayer times are not connected yet.')
                  }
                  className="rounded-full border border-outline-variant/50 px-4 py-2">
                  <Text className="font-label-sm text-label-sm uppercase tracking-widest text-primary">
                    Clear
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
