import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrayerIcon } from '@/components/ui/prayer-icon';
import { SectionHeader } from '@/components/ui/section-header';
import { SettingsCard } from '@/components/ui/settings-card';
import { Toggle } from '@/components/ui/toggle';
import { theme } from '@/constants/theme';
import { useLocation } from '@/features/location';
import { useReminders, REMINDER_TYPE_LABELS, isReminderPrayerKey } from '@/features/reminders';
import { PRAYER_LABELS, PRAYER_ORDER } from '@/features/schedule';
import { cancelReminderSchedule, scheduleTestNotification } from '@/lib/notifications/reminders';
import { clearAll } from '@/lib/storage';

const SETTINGS_PRAYERS = PRAYER_ORDER.filter(isReminderPrayerKey);

export default function SettingsScreen() {
  const { city } = useLocation();
  const { settings, setPrayerEnabled, setGlobal } = useReminders();
  const [cleared, setCleared] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'scheduled' | 'denied' | 'unsupported'>(
    'idle',
  );

  const handleClear = async () => {
    await Promise.all([clearAll(), cancelReminderSchedule()]);
    setCleared(true);
    setTimeout(() => setCleared(false), 1500);
  };

  const handleTestNotification = async () => {
    const result = await scheduleTestNotification();
    const nextStatus =
      result.status === 'scheduled'
        ? 'scheduled'
        : result.status === 'unsupported'
          ? 'unsupported'
          : 'denied';

    setTestStatus(nextStatus);
    setTimeout(() => setTestStatus('idle'), 2500);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView
        contentContainerClassName="px-screen-pad pt-6 pb-12"
        className="flex-1">
        <View className="gap-section-gap">
          <View>
            <Text className="font-headline-xl text-headline-xl text-text">Settings</Text>
            <Text className="mt-1 font-body-sm text-body-sm text-text-sub">
              Manage notifications, location, and your preferences.
            </Text>
          </View>

          {/* Location */}
          <View className="gap-2">
            <SectionHeader>Location</SectionHeader>
            <SettingsCard>
              <View className="flex-row items-center justify-between px-row-pad-x py-row-pad-y">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                    <MaterialIcons name="location-on" size={20} color={theme.primary} />
                  </View>
                  <View>
                    <Text className="font-body-md text-body-md text-text">{city.name}</Text>
                    <Text className="font-caption text-caption text-text-sub">Sweden</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change location"
                  onPress={() => router.push('/select-city')}
                  className="rounded-full border border-primary px-3 py-1.5">
                  <Text className="font-label text-label uppercase text-primary">Change</Text>
                </Pressable>
              </View>
            </SettingsCard>
          </View>

          {/* Prayer Alerts */}
          <View className="gap-2">
            <SectionHeader>Prayer Alerts</SectionHeader>
            <SettingsCard>
              {SETTINGS_PRAYERS.map((key) => {
                const reminder = settings.prayers[key];
                return (
                  <View
                    key={key}
                    className="flex-row items-center justify-between px-row-pad-x py-row-pad-y">
                    <View className="flex-row items-center gap-3">
                      <PrayerIcon prayer={key} size={36} />
                      <View>
                        <Text className="font-body-md text-body-md text-text">
                          {PRAYER_LABELS[key]}
                        </Text>
                        <Text className="font-caption text-caption text-text-sub">
                          {REMINDER_TYPE_LABELS[reminder.type]}
                        </Text>
                      </View>
                    </View>
                    <Toggle
                      value={reminder.enabled}
                      onValueChange={(v) => setPrayerEnabled(key, v)}
                      accessibilityLabel={`${PRAYER_LABELS[key]} alert`}
                    />
                  </View>
                );
              })}
            </SettingsCard>
          </View>

          {/* System */}
          <View className="gap-2">
            <SectionHeader>System</SectionHeader>
            <SettingsCard>
              <View className="flex-row items-center justify-between px-row-pad-x py-row-pad-y">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                    <MaterialIcons name="notifications-active" size={20} color={theme.primary} />
                  </View>
                  <View>
                    <Text className="font-body-md text-body-md text-text">Notifications</Text>
                    <Text className="font-caption text-caption text-text-sub">
                      Master toggle for all alerts
                    </Text>
                  </View>
                </View>
                <Toggle
                  value={settings.global}
                  onValueChange={setGlobal}
                  accessibilityLabel="Global notifications"
                />
              </View>
              <View className="flex-row items-center justify-between gap-3 px-row-pad-x py-row-pad-y">
                <View className="min-w-0 flex-1 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                    <MaterialIcons name="notification-add" size={20} color={theme.primary} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-body-md text-body-md text-text" numberOfLines={1}>
                      Test Notification
                    </Text>
                    <Text className="font-caption text-caption text-text-sub" numberOfLines={1}>
                      Test alert in 1 minute
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Schedule test notification"
                  onPress={handleTestNotification}
                  className={`min-w-[70px] shrink-0 items-center rounded-full px-3 py-1.5 ${testStatus === 'scheduled' ? 'bg-accent' : 'border border-text-sub'}`}>
                  <Text
                    className={`font-label text-label uppercase ${testStatus === 'scheduled' ? 'text-card' : 'text-text-sub'}`}>
                    {testStatus === 'scheduled'
                      ? 'Set'
                      : testStatus === 'denied'
                        ? 'Denied'
                        : testStatus === 'unsupported'
                          ? 'Web'
                          : 'Test'}
                  </Text>
                </Pressable>
              </View>
              <View className="flex-row items-center justify-between px-row-pad-x py-row-pad-y">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                    <MaterialIcons name="cached" size={20} color={theme.primary} />
                  </View>
                  <View>
                    <Text className="font-body-md text-body-md text-text">Clear Cache</Text>
                    <Text className="font-caption text-caption text-text-sub">
                      Reset stored preferences
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear cache"
                  onPress={handleClear}
                  className={`rounded-full px-3 py-1.5 ${cleared ? 'bg-accent' : 'border border-text-sub'}`}>
                  <Text
                    className={`font-label text-label uppercase ${cleared ? 'text-card' : 'text-text-sub'}`}>
                    {cleared ? 'Cleared!' : 'Clear'}
                  </Text>
                </Pressable>
              </View>
            </SettingsCard>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
