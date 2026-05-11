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
      className="relative mx-4 mb-3.5 mt-2.5 overflow-hidden rounded-hero-card bg-card px-card-pad py-4"
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
          style={{ width: 110, height: 110, right: -24, top: -24, opacity: 0.55 }}
        />
      ) : (
        <View
          className="absolute rounded-full bg-primary-light"
          style={{ width: 100, height: 100, right: -24, top: -24, opacity: 0.55 }}
        />
      )}
      {currentInfo.active ? (
        <View
          className="absolute rounded-full bg-primary-light"
          style={{ width: 70, height: 70, left: -14, bottom: -28, opacity: 0.45 }}
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
      <View className="mb-2 flex-row items-center gap-2">
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

      <View className="mb-3 flex-row items-end justify-between gap-3">
        <Text className="shrink font-display-lg text-[40px] leading-10 text-primary">
          {PRAYER_LABELS[currentInfo.name]}
        </Text>

        <View className="items-end">
          <Text className="font-label text-[9px] uppercase leading-3 text-text-sub">Ends in</Text>
          <Text className="font-label text-xl leading-[22px] text-accent">
            {formatRemainingTime(currentInfo.minsUntilEnd)}
          </Text>
          <Text className="font-caption text-[11px] leading-4 text-text-sub">at {currentInfo.endTime}</Text>
        </View>
      </View>

      <View className="mb-3 h-1 overflow-hidden rounded-full bg-primary-light">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between border-t border-primary/10 pt-2.5">
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
    <View className="flex-row items-end justify-between gap-3">
      <View>
        <Text className="mb-1 font-label text-[10px] uppercase leading-3 text-text-sub">Up Next</Text>
        <Text className="font-display-lg text-[32px] leading-9 text-primary">
          {PRAYER_LABELS[currentInfo.waitingFor.name]}
        </Text>
        <Text className="font-time-lg text-xl leading-7 text-text">
          {currentInfo.waitingFor.time}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-label text-[9px] uppercase leading-3 text-text-sub">Starts in</Text>
        <Text className="font-label text-lg leading-5 text-accent">
          {formatRemainingTime(currentInfo.waitingFor.minsRemaining)}
        </Text>
      </View>
    </View>
  );
}
