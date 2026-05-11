import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeroCard } from '@/components/ui/hero-card';
import { theme } from '@/constants/theme';
import { useLocation } from '@/features/location';
import { useReminders } from '@/features/reminders';
import { formatLongDate, isSameDay } from '@/lib/time/format';
import { formatHijri } from '@/lib/time/hijri';
import { currentPrayerInfo } from '@/lib/time/prayer-state';

import { PrayerRow } from '../components/prayer-row';
import { useSchedule } from '../hooks/use-schedule';

export default function PrayerTimesScreen() {
  const { city } = useLocation();
  const { settings, setPrayerEnabled } = useReminders();
  const [date, setDate] = useState<Date>(() => new Date());
  const today = new Date();

  const { day, prayers, next, error } = useSchedule(city.id, date);

  const isToday = isSameDay(date, today);
  const dateLabel = isToday ? 'Today' : formatLongDate(date);
  const currentInfo = day && isToday ? currentPrayerInfo(day.prayers) : null;
  const activeListKey = currentInfo?.active ? currentInfo.name : null;

  const stepDays = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      {/* Header */}
      <View className="px-screen-pad pb-3 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change city, currently ${city.name}`}
            onPress={() => router.push('/select-city')}
            className="flex-row items-center gap-1 p-1">
            <MaterialIcons name="location-on" size={18} color={theme.primary} />
            <Text className="font-body-sm text-body-sm text-text">{city.name}</Text>
          </Pressable>
          <Text className="font-app-title text-app-title text-text">Sweden Prayer</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/(tabs)/settings')}
            className="p-1">
            <MaterialIcons name="notifications-none" size={22} color={theme.text} />
          </Pressable>
        </View>
        <View className="mt-2 items-center">
          <Text className="font-caption text-caption text-text-sub">
            {formatHijri(date)} · {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Date navigator */}
      <View className="flex-row items-center justify-center gap-4 px-screen-pad pb-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous day"
          onPress={() => stepDays(-1)}
          className="rounded-full bg-card p-2"
          style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}>
          <MaterialIcons name="chevron-left" size={20} color={theme.text} />
        </Pressable>
        <Text className="font-body-md text-body-md text-text">{dateLabel}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next day"
          onPress={() => stepDays(1)}
          className="rounded-full bg-card p-2"
          style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}>
          <MaterialIcons name="chevron-right" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-screen-pad pb-12"
        className="flex-1">
        <View className="gap-section-gap">
          {error ? (
            <Text className="font-body-md text-body-md text-text-sub">
              {error}
            </Text>
          ) : null}

          {currentInfo ? (
            <HeroCard currentInfo={currentInfo} />
          ) : next ? (
            <View
              className="relative overflow-hidden rounded-hero-card bg-card px-card-pad py-8"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}>
              <View
                className="absolute rounded-full bg-primary-light"
                style={{ width: 120, height: 120, right: -20, top: -20, opacity: 0.6 }}
              />
              <Text className="font-label text-label uppercase text-text-sub">Prayer Schedule</Text>
              <Text className="mt-2 font-display-lg text-display-lg text-primary">{next.label}</Text>
              <Text className="mt-1 font-time-lg text-time-lg text-text">{next.time}</Text>
            </View>
          ) : null}

          <View className="gap-row-gap">
            {prayers.map((p) => {
              const isCurrent = isToday && activeListKey === p.key;
              const isPast = !isCurrent && p.date.getTime() < new Date().getTime();
              return (
                <PrayerRow
                  key={p.key}
                  prayerKey={p.key}
                  name={p.label}
                  time={p.time}
                  current={isCurrent}
                  past={isPast}
                  reminderActive={settings.global && (settings.prayers[p.key]?.enabled ?? false)}
                  onToggleReminder={() =>
                    setPrayerEnabled(p.key, !(settings.prayers[p.key]?.enabled ?? false))
                  }
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
