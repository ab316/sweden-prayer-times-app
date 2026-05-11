import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeroCard } from '@/components/ui/hero-card';
import { theme } from '@/constants/theme';
import { useLocation } from '@/features/location';
import { useReminders } from '@/features/reminders';
import { isSameDay } from '@/lib/time/format';
import { formatScheduleHijri } from '@/lib/time/hijri';
import { currentPrayerInfo } from '@/lib/time/prayer-state';

import { PrayerRow } from '../components/prayer-row';
import { useSchedule } from '../hooks/use-schedule';
import { PRAYER_LABELS } from '../types';

export default function PrayerTimesScreen() {
  const { city } = useLocation();
  const { settings, setPrayerEnabled } = useReminders();
  const [date, setDate] = useState<Date>(() => new Date());
  const today = new Date();

  const { day, prayers, error } = useSchedule(city.id, date);

  const isToday = isSameDay(date, today);
  const dateLabel = isToday
    ? 'Today'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const currentInfo = day && isToday ? currentPrayerInfo(day.prayers) : null;
  const activeListKey = currentInfo?.active ? currentInfo.name : null;

  const stepDays = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <View className="px-[22px] pb-3 pt-3.5">
        <View className="mb-2.5 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change city, currently ${city.name}`}
            onPress={() => router.push('/select-city')}
            className="h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
            <MaterialIcons name="location-on" size={16} color={theme.primary} />
          </Pressable>

          <Text className="font-app-title text-app-title text-primary">Sweden Prayer</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/(tabs)/settings')}
            className="h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
            <MaterialIcons name="notifications-none" size={16} color={theme.primary} />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            onPress={() => stepDays(-1)}
            className="h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]">
            <MaterialIcons name="chevron-left" size={19} color={theme.textSub} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change city, currently ${city.name}`}
            onPress={() => router.push('/select-city')}
            className="min-w-0 flex-1 items-center">
            <View className="max-w-full flex-row items-center justify-center gap-[5px]">
              <MaterialIcons name="location-on" size={12} color={theme.primary} />
              <Text className="font-body-md text-body-md text-text" numberOfLines={1}>
                {city.name}
              </Text>
              <Text
                className={`font-caption text-sm leading-5 ${isToday ? 'text-primary' : 'text-text'}`}
                numberOfLines={1}>
                {'\u00b7'} {dateLabel}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={13} color={theme.textSub} />
            </View>
            <Text className="font-caption text-[11px] leading-4 text-text-sub" numberOfLines={1}>
              {day ? formatScheduleHijri(day.hijri) : ''}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next day"
            onPress={() => stepDays(1)}
            className="h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]">
            <MaterialIcons name="chevron-right" size={19} color={theme.textSub} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerClassName="pb-12" className="flex-1">
        <View>
          {error ? (
            <Text className="mx-screen-pad mt-6 rounded-md bg-card px-4 py-3 font-body-md text-body-md text-text-sub">
              {error}
            </Text>
          ) : null}

          {currentInfo ? (
            <HeroCard currentInfo={currentInfo} />
          ) : day ? (
            <View
              className="relative mx-4 mb-3 mt-2 overflow-hidden rounded-[18px] bg-card px-[18px] py-3.5"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}>
              <View
                className="absolute rounded-full bg-primary-light"
                style={{ width: 100, height: 100, right: -24, top: -24, opacity: 0.55 }}
              />
              <View className="relative flex-row items-end justify-between gap-3">
                <View>
                  <Text className="mb-1 font-label text-[10px] uppercase leading-3 text-text-sub">
                    Prayer Schedule
                  </Text>
                  <Text className="font-display-lg text-[32px] leading-9 text-primary">
                    {PRAYER_LABELS.fajr}
                  </Text>
                  <Text className="font-time-lg text-xl leading-7 text-text">{day.prayers.fajr}</Text>
                </View>
              </View>
            </View>
          ) : null}

          <View className="gap-[7px] px-4">
            {prayers.map((p) => {
              const isCurrent = isToday && activeListKey === p.key;
              const isPast = isToday && !isCurrent && p.date.getTime() < new Date().getTime();

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
