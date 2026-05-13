import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { SCHEDULES_2026 } from '@/features/schedule/data/registry';
import { PRAYER_LABELS, PRAYER_ORDER, type DaySchedule } from '@/features/schedule/types';
import type { ReminderPrayerKey, ReminderSettings } from '@/features/reminders/types';
import { isoDateKey } from '@/lib/time/format';

const REMINDER_CHANNEL_ID = 'prayer-reminders';
const DEFAULT_SCHEDULE_DAYS = 7;

export type ReminderScheduleStatus =
  | 'scheduled'
  | 'cancelled'
  | 'permission-denied'
  | 'permission-not-requested'
  | 'unsupported'
  | 'no-schedule';

export type RebuildReminderScheduleOptions = {
  cityId: number;
  settings: ReminderSettings;
  startDate?: Date;
  days?: number;
  requestPermission?: boolean;
};

export type ReminderScheduleResult = {
  status: ReminderScheduleStatus;
  scheduledCount: number;
};

const REMINDER_PRAYERS = PRAYER_ORDER.filter((key): key is ReminderPrayerKey => key !== 'sunrise');

function isNotificationsSupported() {
  return Platform.OS !== 'web';
}

function parsePrayerDate(day: DaySchedule, hhmm: string) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const date = new Date(`${day.date}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function buildReminderBody(prayerName: string) {
  return `${prayerName} prayer time`;
}

async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Prayer reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

async function ensureNotificationPermission(requestPermission: boolean) {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!requestPermission || !current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export function configureLocalNotifications() {
  if (!isNotificationsSupported()) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function cancelReminderSchedule(): Promise<ReminderScheduleResult> {
  if (!isNotificationsSupported()) {
    return { status: 'unsupported', scheduledCount: 0 };
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  return { status: 'cancelled', scheduledCount: 0 };
}

export async function scheduleTestNotification(): Promise<ReminderScheduleResult> {
  if (!isNotificationsSupported()) {
    return { status: 'unsupported', scheduledCount: 0 };
  }

  const permissionGranted = await ensureNotificationPermission(true);
  if (!permissionGranted) {
    return { status: 'permission-denied', scheduledCount: 0 };
  }

  await ensureNotificationChannel();

  const date = new Date(Date.now() + 60_000);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Prayer reminder test',
      body: 'This is a test notification from Sweden Prayer.',
      sound: true,
      data: {
        kind: 'prayer-reminder-test',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: REMINDER_CHANNEL_ID,
    },
  });

  return { status: 'scheduled', scheduledCount: 1 };
}

export async function rebuildReminderSchedule({
  cityId,
  settings,
  startDate = new Date(),
  days = DEFAULT_SCHEDULE_DAYS,
  requestPermission = false,
}: RebuildReminderScheduleOptions): Promise<ReminderScheduleResult> {
  if (!isNotificationsSupported()) {
    return { status: 'unsupported', scheduledCount: 0 };
  }

  if (!settings.global) {
    return cancelReminderSchedule();
  }

  const permissionGranted = await ensureNotificationPermission(requestPermission);
  if (!permissionGranted) {
    return {
      status: requestPermission ? 'permission-denied' : 'permission-not-requested',
      scheduledCount: 0,
    };
  }

  const schedule = SCHEDULES_2026[cityId];
  if (!schedule) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return { status: 'no-schedule', scheduledCount: 0 };
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  const now = new Date();

  const daysToSchedule = schedule.days.filter((day) => {
    const dayDate = new Date(`${day.date}T00:00:00`);
    return dayDate >= start && dayDate < end;
  });

  await ensureNotificationChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  let scheduledCount = 0;
  for (const day of daysToSchedule) {
    for (const prayerKey of REMINDER_PRAYERS) {
      const reminder = settings.prayers[prayerKey];
      if (!reminder.enabled || reminder.type === 'silent') continue;

      const date = parsePrayerDate(day, day.prayers[prayerKey]);
      if (date <= now) continue;

      const prayerName = PRAYER_LABELS[prayerKey];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayerName} time`,
          body: buildReminderBody(prayerName),
          sound: true,
          data: {
            kind: 'prayer-reminder',
            prayer: prayerKey,
            cityId,
            date: isoDateKey(date),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: REMINDER_CHANNEL_ID,
        },
      });
      scheduledCount += 1;
    }
  }

  return { status: 'scheduled', scheduledCount };
}
