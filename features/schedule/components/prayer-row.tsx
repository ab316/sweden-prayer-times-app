import { Text, View } from 'react-native';

import { NotifBell } from '@/components/ui/notif-bell';
import { PrayerIcon } from '@/components/ui/prayer-icon';

import type { PrayerKey } from '../types';

export type PrayerRowProps = {
  prayerKey: PrayerKey;
  name: string;
  time: string;
  current?: boolean;
  past?: boolean;
  reminderActive: boolean;
  onToggleReminder?: () => void;
};

export function PrayerRow({
  prayerKey,
  name,
  time,
  current,
  past,
  reminderActive,
  onToggleReminder,
}: PrayerRowProps) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${name}, ${time}${current ? ', current prayer' : ''}`}
      className={`relative flex-row items-center justify-between rounded-[13px] bg-card px-3.5 py-[11px] ${current ? 'border-l-[3px] border-current-border bg-current-row' : 'border-l-[3px] border-transparent'}`}
      style={{
        opacity: past ? 0.55 : 1,
        shadowColor: current ? '#d96a4a' : '#000',
        shadowOpacity: current ? 0.18 : 0.05,
        shadowRadius: current ? 12 : 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}>
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <PrayerIcon prayer={prayerKey} size={34} emphasized={current} />
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Text className="font-body-md text-body-md text-text" numberOfLines={1}>
            {name}
          </Text>
          {current ? (
            <Text className="font-label text-[10px] uppercase leading-3 text-accent">Now</Text>
          ) : null}
        </View>
      </View>
      <View className="flex-row items-center gap-1.5">
        {onToggleReminder ? (
          <NotifBell
            active={reminderActive}
            onPress={onToggleReminder}
            size={18}
            accessibilityLabel={`${reminderActive ? 'Disable' : 'Enable'} ${name} reminder`}
          />
        ) : null}
        <Text className={`min-w-[44px] text-right font-time-md text-time-md ${current ? 'text-accent' : 'text-text'}`}>
          {time}
        </Text>
      </View>
    </View>
  );
}
