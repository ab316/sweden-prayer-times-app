import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { theme } from '@/constants/theme';
import type { PrayerKey } from '@/features/schedule/types';

const ICON_BY_PRAYER: Record<PrayerKey, keyof typeof MaterialIcons.glyphMap> = {
  fajr: 'nightlight',
  sunrise: 'wb-twilight',
  dhuhr: 'light-mode',
  asr: 'wb-sunny',
  maghrib: 'nights-stay',
  isha: 'dark-mode',
};

type Props = {
  prayer: PrayerKey;
  size?: number;
  emphasized?: boolean;
};

export function PrayerIcon({ prayer, size = 40, emphasized = false }: Props) {
  return (
    <View
      className={`items-center justify-center rounded-full ${emphasized ? 'bg-accent-light' : 'bg-primary-light'}`}
      style={{ width: size, height: size }}>
      <MaterialIcons
        name={ICON_BY_PRAYER[prayer]}
        size={Math.round(size * 0.55)}
        color={emphasized ? theme.accent : theme.primary}
      />
    </View>
  );
}
