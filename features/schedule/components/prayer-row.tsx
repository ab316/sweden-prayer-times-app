import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export type PrayerRowProps = {
  name: string;
  time: string;
  icon: MaterialIconName;
  current?: boolean;
};

export function PrayerRow({ name, time, icon, current }: PrayerRowProps) {
  if (current) {
    return (
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${name}, ${time}, current prayer`}
        className="relative flex-row items-center justify-between overflow-hidden rounded-2xl border border-secondary-container bg-secondary-fixed/30 p-5"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}>
        <View className="absolute bottom-0 left-0 top-0 w-1.5 bg-secondary" />
        <View className="flex-row items-center gap-4 pl-2">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary-container/50">
            <MaterialIcons name={icon} size={24} color="#785a1a" />
          </View>
          <View className="flex-col">
            <Text className="font-headline-md text-headline-md text-on-secondary-fixed">{name}</Text>
            <Text className="mt-1 font-label-sm text-label-sm uppercase tracking-widest text-secondary">
              Current
            </Text>
          </View>
        </View>
        <Text className="font-body-lg text-body-lg font-semibold text-on-secondary-fixed">{time}</Text>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${name}, ${time}`}
      className="flex-row items-center justify-between rounded-xl border border-surface-variant/50 bg-surface-container-lowest p-4"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}>
      <View className="flex-row items-center gap-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
          <MaterialIcons name={icon} size={20} color="#707974" />
        </View>
        <Text className="font-headline-md text-headline-md text-on-surface">{name}</Text>
      </View>
      <Text className="font-body-lg text-body-lg text-on-surface-variant">{time}</Text>
    </View>
  );
}
