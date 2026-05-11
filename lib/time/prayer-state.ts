export type PrayerStateKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

type RealPrayerKey = Exclude<PrayerStateKey, 'sunrise'>;

export type ActivePrayerInfo = {
  active: true;
  name: RealPrayerKey;
  startTime: string;
  endTime: string;
  minsUntilEnd: number;
  next: { name: PrayerStateKey; time: string; tomorrow: boolean };
};

export type WaitingPrayerInfo = {
  active: false;
  waitingFor: { name: 'fajr' | 'dhuhr'; time: string; minsRemaining: number };
};

export type CurrentPrayerInfo = ActivePrayerInfo | WaitingPrayerInfo;

export function toMinutes(timeStr: string | undefined): number {
  if (!timeStr || timeStr === '--:--') return -1;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function nowMinutes(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function nextPrayerInfo(
  schedule: Record<PrayerStateKey, string>,
  now = new Date(),
): { name: PrayerStateKey; time: string; minsRemaining: number; tomorrow: boolean } {
  const order: PrayerStateKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const currentMinute = nowMinutes(now);

  for (const p of order) {
    const t = toMinutes(schedule[p]);
    if (t !== -1 && currentMinute < t) {
      return { name: p, time: schedule[p], minsRemaining: t - currentMinute, tomorrow: false };
    }
  }

  const fajrT = toMinutes(schedule.fajr);
  const mins = fajrT === -1 ? 0 : (24 * 60 - currentMinute) + fajrT;
  return { name: 'fajr', time: schedule.fajr, minsRemaining: mins, tomorrow: true };
}

export function currentPrayerInfo(
  schedule: Record<PrayerStateKey, string>,
  now = new Date(),
): CurrentPrayerInfo {
  const prayers: RealPrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const currentMinute = nowMinutes(now);

  let activeKey: RealPrayerKey | null = null;
  for (let i = prayers.length - 1; i >= 0; i -= 1) {
    const t = toMinutes(schedule[prayers[i]]);
    if (t !== -1 && currentMinute >= t) {
      activeKey = prayers[i];
      break;
    }
  }

  if (!activeKey) {
    const fajrT = toMinutes(schedule.fajr);
    return {
      active: false,
      waitingFor: {
        name: 'fajr',
        time: schedule.fajr,
        minsRemaining: fajrT === -1 ? 0 : fajrT - currentMinute,
      },
    };
  }

  if (activeKey === 'fajr') {
    const sunriseT = toMinutes(schedule.sunrise);
    const dhuhrT = toMinutes(schedule.dhuhr);

    if (sunriseT !== -1 && currentMinute >= sunriseT) {
      return {
        active: false,
        waitingFor: {
          name: 'dhuhr',
          time: schedule.dhuhr,
          minsRemaining: dhuhrT === -1 ? 0 : dhuhrT - currentMinute,
        },
      };
    }

    return {
      active: true,
      name: 'fajr',
      startTime: schedule.fajr,
      endTime: schedule.sunrise,
      minsUntilEnd: sunriseT === -1 ? 0 : sunriseT - currentMinute,
      next: { name: 'dhuhr', time: schedule.dhuhr, tomorrow: false },
    };
  }

  const next = nextPrayerInfo(schedule, now);
  return {
    active: true,
    name: activeKey,
    startTime: schedule[activeKey],
    endTime: next.time,
    minsUntilEnd: next.minsRemaining,
    next: { name: next.name, time: next.time, tomorrow: next.tomorrow },
  };
}

export function formatRemainingTime(mins: number): string {
  if (mins <= 0) return 'Now';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function prayerProgress(info: CurrentPrayerInfo): number {
  if (!info.active) return 0;

  const startM = toMinutes(info.startTime);
  const endM = toMinutes(info.endTime);
  if (startM === -1 || endM === -1) return 0;

  const total = endM > startM ? endM - startM : 24 * 60 - startM + endM;
  const elapsed = total - info.minsUntilEnd;
  return Math.max(0, Math.min(1, elapsed / total));
}
