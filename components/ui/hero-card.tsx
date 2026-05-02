import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  prayerName: string;
  time: string;
  countdown: string;
};

export function HeroCard({ prayerName, time, countdown }: Props) {
  return (
    <View
      className="relative overflow-hidden rounded-hero-card bg-card px-card-pad py-8"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}>
      {/* Decorative circles */}
      <View
        className="absolute rounded-full bg-primary-light"
        style={{ width: 140, height: 140, right: -40, top: -40, opacity: 0.5 }}
      />
      <View
        className="absolute rounded-full bg-accent-light"
        style={{ width: 90, height: 90, left: -30, bottom: -30, opacity: 0.6 }}
      />

      <Text className="font-label text-label uppercase text-text-sub">Next</Text>
      <View className="mt-3 items-start">
        <Text className="font-display-lg text-display-lg text-primary">{prayerName}</Text>
        <Text className="mt-1 font-time-lg text-time-lg text-text">{time}</Text>
      </View>
      <View className="mt-5 flex-row self-start items-center gap-2 rounded-full bg-accent px-3 py-1.5">
        <MaterialIcons name="schedule" size={14} color="#ffffff" />
        <Text className="font-label text-label uppercase text-card" style={{ color: theme.card }}>
          in {countdown}
        </Text>
      </View>
    </View>
  );
}
