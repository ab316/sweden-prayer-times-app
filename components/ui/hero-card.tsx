import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { PRAYER_LABELS } from '@/features/schedule/types';
import {
  formatRemainingTime,
  prayerProgress,
  type CurrentPrayerInfo,
} from '@/lib/time/prayer-state';

type Props = {
  currentInfo: CurrentPrayerInfo;
};

export function HeroCard({ currentInfo }: Props) {
  const progress = prayerProgress(currentInfo);

  return (
    <View
      className="relative overflow-hidden rounded-hero-card bg-card px-card-pad py-card-pad"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}>
      {currentInfo.active ? (
        <View
          className="absolute rounded-full bg-accent-light"
          style={{ width: 120, height: 120, right: -20, top: -20, opacity: 0.6 }}
        />
      ) : (
        <View
          className="absolute rounded-full bg-primary-light"
          style={{ width: 120, height: 120, right: -20, top: -20, opacity: 0.6 }}
        />
      )}
      {currentInfo.active ? (
        <View
          className="absolute rounded-full bg-primary-light"
          style={{ width: 80, height: 80, left: -10, bottom: -30, opacity: 0.5 }}
        />
      ) : null}

      {currentInfo.active ? (
        <ActiveHeroContent currentInfo={currentInfo} progress={progress} />
      ) : (
        <WaitingHeroContent currentInfo={currentInfo} />
      )}
    </View>
  );
}

function ActiveHeroContent({
  currentInfo,
  progress,
}: {
  currentInfo: Extract<CurrentPrayerInfo, { active: true }>;
  progress: number;
}) {
  return (
    <View>
      <View className="mb-1.5 flex-row items-center gap-2">
        <View
          className="h-1.5 w-1.5 rounded-full bg-accent"
          style={{ shadowColor: theme.accent, shadowOpacity: 0.35, shadowRadius: 4 }}
        />
        <Text className="font-label text-[10px] uppercase leading-3 text-accent">
          Current Prayer
        </Text>
        <Text className="font-caption text-[10px] uppercase leading-3 text-text-sub">
          {'\u00b7'} started {currentInfo.startTime}
        </Text>
      </View>

      <Text className="mb-3.5 font-display-lg text-display-lg text-primary">
        {PRAYER_LABELS[currentInfo.name]}
      </Text>

      <View className="mb-3.5 flex-row self-start items-center gap-2 rounded-full border border-accent/30 bg-accent-light px-3.5 py-1.5">
        <MaterialIcons name="schedule" size={13} color={theme.accent} />
        <Text className="font-body-md text-[13px] leading-4 text-accent">
          Ends in {formatRemainingTime(currentInfo.minsUntilEnd)}
        </Text>
        <Text className="font-caption text-xs text-accent opacity-70">
          {'\u00b7'} {currentInfo.endTime}
        </Text>
      </View>

      <View className="mb-3.5 h-1 overflow-hidden rounded-full bg-primary-light">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between border-t border-primary/10 pt-3">
        <View className="flex-row items-center gap-2">
          <Text className="font-label text-[10px] uppercase leading-3 text-text-sub">Then</Text>
          <Text className="font-body-md text-sm leading-5 text-text">
            {PRAYER_LABELS[currentInfo.next.name]}
          </Text>
          {currentInfo.next.tomorrow ? (
            <Text className="font-caption text-[10px] uppercase leading-3 text-text-sub">
              {'\u00b7'} tomorrow
            </Text>
          ) : null}
        </View>
        <Text className="font-time-md text-sm leading-5 text-primary">{currentInfo.next.time}</Text>
      </View>
    </View>
  );
}

function WaitingHeroContent({
  currentInfo,
}: {
  currentInfo: Extract<CurrentPrayerInfo, { active: false }>;
}) {
  return (
    <View>
      <Text className="mb-1.5 font-label text-[10px] uppercase leading-3 text-text-sub">
        Up Next
      </Text>
      <Text className="font-display-lg text-display-lg text-primary">
        {PRAYER_LABELS[currentInfo.waitingFor.name]}
      </Text>
      <Text className="mb-3 font-time-lg text-time-lg text-text">
        {currentInfo.waitingFor.time}
      </Text>
      <View className="flex-row self-start items-center gap-1.5 rounded-full border border-accent/30 bg-accent-light px-3 py-1.5">
        <MaterialIcons name="schedule" size={12} color={theme.accent} />
        <Text className="font-caption text-xs text-accent">
          Starts in {formatRemainingTime(currentInfo.waitingFor.minsRemaining)}
        </Text>
      </View>
    </View>
  );
}
