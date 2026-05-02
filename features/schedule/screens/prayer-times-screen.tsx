import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrayerRow, type PrayerRowProps } from '../components/prayer-row';

type PrayerEntry = Pick<PrayerRowProps, 'name' | 'time' | 'icon' | 'current'>;

const PRAYERS: PrayerEntry[] = [
  { name: 'Fajr', time: '04:32', icon: 'nightlight' },
  { name: 'Shuruk', time: '06:45', icon: 'wb-twilight' },
  { name: 'Dhuhr', time: '12:50', icon: 'light-mode' },
  { name: 'Asr', time: '15:35', icon: 'wb-sunny', current: true },
  { name: 'Maghrib', time: '18:42', icon: 'nights-stay' },
  { name: 'Isha', time: '20:15', icon: 'dark-mode' },
];

export default function PrayerTimesScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between border-b border-outline-variant/50 bg-surface px-6 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          onPress={() => {}}
          className="rounded-full p-2">
          <MaterialIcons name="menu" size={24} color="#003527" />
        </Pressable>
        <Text
          style={{ fontFamily: 'NotoSerif_600SemiBold_Italic' }}
          className="text-lg tracking-wide text-emerald-900">
          Sakinah Bloom
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => {}}
          className="rounded-full p-2">
          <MaterialIcons name="notifications" size={24} color="#003527" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-container-padding pt-6 pb-section-gap"
        className="flex-1">
        <View className="gap-section-gap">
          <View className="items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change city, currently Gothenburg, Sweden"
              onPress={() => router.push('/select-city')}
              className="flex-row items-center gap-2 rounded-full px-3 py-1">
              <MaterialIcons name="location-on" size={18} color="#404944" />
              <Text className="font-body-md text-body-md text-on-surface-variant">
                Gothenburg, SE
              </Text>
            </Pressable>
            <Text className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant/70">
              12 Rabi&apos; al-Awwal / 27 September 2023
            </Text>
          </View>

          <View
            className="items-center justify-center overflow-hidden rounded-[32px] bg-surface-container-lowest p-8"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}>
            <Text className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
              Next
            </Text>
            <View className="mt-4 items-center">
              <Text className="font-display-lg text-display-lg text-primary">Asr</Text>
              <Text className="mt-2 font-headline-xl text-headline-xl text-on-surface">15:35</Text>
            </View>
            <View className="mt-6 flex-row items-center gap-2 rounded-full bg-tertiary-fixed px-4 py-2">
              <MaterialIcons name="schedule" size={16} color="#494740" />
              <Text className="font-label-sm text-label-sm text-on-tertiary-fixed-variant">
                -00:45 remaining
              </Text>
            </View>
          </View>

          <View className="gap-4">
            {PRAYERS.map((p) => (
              <PrayerRow
                key={p.name}
                name={p.name}
                time={p.time}
                icon={p.icon}
                current={p.current}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
