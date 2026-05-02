import { Pressable, Text, View } from 'react-native';

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
  onToggleReminder: () => void;
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
      className={`relative flex-row items-center justify-between rounded-prayer-row bg-card px-row-pad-x py-row-pad-y ${current ? 'border-l-[3px] border-current-border bg-current-row' : ''}`}
      style={{
        opacity: past ? 0.55 : 1,
        shadowColor: current ? '#c8892a' : '#000',
        shadowOpacity: current ? 0.18 : 0.05,
        shadowRadius: current ? 12 : 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}>
      <View className="flex-row items-center gap-3">
        <PrayerIcon prayer={prayerKey} size={36} emphasized={current} />
        <View className="flex-col">
          <Text className="font-body-md text-body-md text-text">{name}</Text>
          {current ? (
            <Text className="mt-0.5 font-label text-label uppercase text-accent">Current</Text>
          ) : null}
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable onPress={onToggleReminder} hitSlop={8}>
          <NotifBell active={reminderActive} onPress={onToggleReminder} />
        </Pressable>
        <Text className="font-time-md text-time-md text-text">{time}</Text>
      </View>
    </View>
  );
}
