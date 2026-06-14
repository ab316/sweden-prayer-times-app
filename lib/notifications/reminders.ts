import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { DEFAULT_CITY } from '@/features/location/types';
import { SCHEDULES_2026 } from '@/features/schedule/data/registry';
import { PRAYER_LABELS, PRAYER_ORDER, type DaySchedule } from '@/features/schedule/types';
import {
  DEFAULT_REMINDER_SETTINGS,
  normalizeReminderSettings,
  type ReminderPrayerKey,
  type ReminderScheduleMetadata,
  type ReminderSettings,
} from '@/features/reminders/types';
import {
  clearReminderScheduleMetadata,
  loadReminderScheduleMetadata,
  loadReminderSettings,
  loadSelectedCity,
  saveReminderScheduleMetadata,
} from '@/lib/storage';
import { isoDateKey } from '@/lib/time/format';

const REMINDER_CHANNEL_ID = 'prayer-reminders';
const MAX_PENDING_PRAYER_NOTIFICATIONS = 50;
const RENEWAL_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000;

/** High-level outcome of trying to schedule or refresh prayer reminders. */
export type ReminderScheduleStatus =
  | 'scheduled'
  | 'fresh'
  | 'cancelled'
  | 'permission-denied'
  | 'permission-not-requested'
  | 'unsupported'
  | 'no-schedule';

/** Inputs for a forced rebuild of the OS-registered prayer reminders. */
export type RebuildReminderScheduleOptions = {
  cityId: number;
  settings: ReminderSettings;
  startDate?: Date;
  requestPermission?: boolean;
};

/** Inputs for checking whether the rolling reminder schedule needs renewal. */
export type EnsureReminderScheduleFreshOptions = {
  cityId?: number;
  settings?: ReminderSettings;
  requestPermission?: boolean;
  force?: boolean;
};

/** Summary of the current scheduling operation for UI or diagnostics. */
export type ReminderScheduleResult = {
  status: ReminderScheduleStatus;
  scheduledCount: number;
  scheduledThrough?: string | null;
};

/** Internal representation of one future prayer reminder before it is sent to the OS. */
type PlannedReminder = {
  prayerKey: ReminderPrayerKey;
  cityId: number;
  date: Date;
  title: string;
  body: string;
};

const REMINDER_PRAYERS = PRAYER_ORDER.filter((key): key is ReminderPrayerKey => key !== 'sunrise');

/** Returns whether Expo Notifications can schedule native reminders on this platform. */
function isNotificationsSupported() {
  return Platform.OS !== 'web';
}

/** Combines a bundled schedule date and HH:mm prayer time into a local Date trigger. */
function parsePrayerDate(day: DaySchedule, hhmm: string) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const date = new Date(`${day.date}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** Builds the notification body for a prayer reminder. */
function buildReminderBody(prayerName: string) {
  return `${prayerName} prayer time`;
}

/** Checks whether settings contain at least one enabled non-silent prayer reminder. */
function hasEnabledReminder(settings: ReminderSettings) {
  return REMINDER_PRAYERS.some((prayerKey) => {
    const reminder = settings.prayers[prayerKey];
    return reminder.enabled && reminder.type !== 'silent';
  });
}

/** Produces a stable hash for the scheduling-relevant reminder settings. */
function buildSettingsHash(settings: ReminderSettings) {
  return JSON.stringify({
    global: settings.global,
    prayers: REMINDER_PRAYERS.map((key) => [
      key,
      settings.prayers[key].enabled,
      settings.prayers[key].type,
    ]),
  });
}

/** Identifies prayer reminders so rebuilds do not cancel unrelated scheduled notifications. */
function isPrayerReminderNotification(notification: Notifications.NotificationRequest) {
  return notification.content.data?.kind === 'prayer-reminder';
}

/** Creates persisted metadata describing the schedule just registered with the OS. */
function buildScheduleMetadata({
  cityId,
  settingsHash,
  scheduledThrough,
  scheduledCount,
}: {
  cityId: number;
  settingsHash: string;
  scheduledThrough: string | null;
  scheduledCount: number;
}): ReminderScheduleMetadata {
  return {
    cityId,
    settingsHash,
    scheduledThrough,
    scheduledCount,
    lastRebuiltAt: new Date().toISOString(),
  };
}

/** Decides whether persisted reminder coverage is missing, stale, changed, or near expiry. */
function shouldRenewSchedule(
  metadata: ReminderScheduleMetadata | null,
  cityId: number,
  settingsHash: string,
  now = new Date(),
) {
  if (!metadata) return true;
  if (metadata.cityId !== cityId) return true;
  if (metadata.settingsHash !== settingsHash) return true;
  if (!metadata.scheduledThrough) return true;

  const scheduledThrough = new Date(metadata.scheduledThrough);
  if (Number.isNaN(scheduledThrough.getTime())) return true;

  return scheduledThrough.getTime() - now.getTime() <= RENEWAL_THRESHOLD_MS;
}

/** Builds the next chronological reminder plan, capped before any OS notifications are touched. */
function buildReminderPlan({
  cityId,
  settings,
  startDate = new Date(),
}: RebuildReminderScheduleOptions) {
  const schedule = SCHEDULES_2026[cityId];
  if (!schedule) return null;

  const now = new Date(startDate);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const reminders: PlannedReminder[] = [];
  for (const day of schedule.days) {
    const dayDate = new Date(`${day.date}T00:00:00`);
    if (dayDate < start) continue;

    for (const prayerKey of REMINDER_PRAYERS) {
      const reminder = settings.prayers[prayerKey];
      if (!reminder.enabled || reminder.type === 'silent') continue;

      const date = parsePrayerDate(day, day.prayers[prayerKey]);
      if (date <= now) continue;

      const prayerName = PRAYER_LABELS[prayerKey];
      reminders.push({
        prayerKey,
        cityId,
        date,
        title: `${prayerName} time`,
        body: buildReminderBody(prayerName),
      });
    }
  }

  return reminders
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_PENDING_PRAYER_NOTIFICATIONS);
}

/** Ensures the Android notification channel exists before scheduling reminders. */
async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Prayer reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

/** Checks notification permission, optionally requesting it at the moment of user opt-in. */
async function ensureNotificationPermission(requestPermission: boolean) {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!requestPermission || !current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Cancels only prayer reminders previously scheduled by this app. */
async function cancelPrayerReminderNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    notifications
      .filter(isPrayerReminderNotification)
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
  );
}

/** Configures foreground notification presentation for local reminders. */
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

/** Cancels all currently scheduled prayer reminders and clears schedule metadata. */
export async function cancelReminderSchedule(): Promise<ReminderScheduleResult> {
  if (!isNotificationsSupported()) {
    return { status: 'unsupported', scheduledCount: 0, scheduledThrough: null };
  }

  await cancelPrayerReminderNotifications();
  await clearReminderScheduleMetadata();
  return { status: 'cancelled', scheduledCount: 0, scheduledThrough: null };
}

/** Schedules a one-minute test notification without disturbing prayer reminders. */
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
      body: 'This is a test notification from Sakinah Bloom.',
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

/** Replaces the current prayer reminder schedule with a validated capped future plan. */
export async function rebuildReminderSchedule({
  cityId,
  settings,
  startDate = new Date(),
  requestPermission = false,
}: RebuildReminderScheduleOptions): Promise<ReminderScheduleResult> {
  const normalizedSettings = normalizeReminderSettings(settings) ?? DEFAULT_REMINDER_SETTINGS;

  if (!isNotificationsSupported()) {
    return { status: 'unsupported', scheduledCount: 0 };
  }

  const settingsHash = buildSettingsHash(normalizedSettings);

  if (!normalizedSettings.global || !hasEnabledReminder(normalizedSettings)) {
    return cancelReminderSchedule();
  }

  const permissionGranted = await ensureNotificationPermission(requestPermission);
  if (!permissionGranted) {
    return {
      status: requestPermission ? 'permission-denied' : 'permission-not-requested',
      scheduledCount: 0,
    };
  }

  const plannedReminders = buildReminderPlan({
    cityId,
    settings: normalizedSettings,
    startDate,
  });
  if (!plannedReminders) {
    return { status: 'no-schedule', scheduledCount: 0 };
  }

  const scheduledThrough =
    plannedReminders.length > 0
      ? plannedReminders[plannedReminders.length - 1].date.toISOString()
      : null;

  await ensureNotificationChannel();
  await cancelPrayerReminderNotifications();

  for (const reminder of plannedReminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: true,
        data: {
          kind: 'prayer-reminder',
          prayer: reminder.prayerKey,
          cityId: reminder.cityId,
          date: isoDateKey(reminder.date),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  }

  await saveReminderScheduleMetadata(
    buildScheduleMetadata({
      cityId,
      settingsHash,
      scheduledThrough,
      scheduledCount: plannedReminders.length,
    }),
  );

  return {
    status: 'scheduled',
    scheduledCount: plannedReminders.length,
    scheduledThrough,
  };
}

/** Refreshes reminders only when persisted coverage is stale, near expiry, or explicitly forced. */
export async function ensureReminderScheduleFresh({
  cityId,
  settings,
  requestPermission = false,
  force = false,
}: EnsureReminderScheduleFreshOptions = {}): Promise<ReminderScheduleResult> {
  const [storedSettings, storedCity, metadata] = await Promise.all([
    settings ? Promise.resolve(settings) : loadReminderSettings(),
    cityId ? Promise.resolve(null) : loadSelectedCity(),
    loadReminderScheduleMetadata(),
  ]);

  const normalizedSettings =
    normalizeReminderSettings(storedSettings) ?? DEFAULT_REMINDER_SETTINGS;
  const resolvedCityId = cityId ?? storedCity?.id ?? DEFAULT_CITY.id;
  const settingsHash = buildSettingsHash(normalizedSettings);

  if (!force && !shouldRenewSchedule(metadata, resolvedCityId, settingsHash)) {
    return {
      status: 'fresh',
      scheduledCount: metadata?.scheduledCount ?? 0,
      scheduledThrough: metadata?.scheduledThrough ?? null,
    };
  }

  return rebuildReminderSchedule({
    cityId: resolvedCityId,
    settings: normalizedSettings,
    requestPermission,
  });
}

/** Maximum prayer reminders this app will register with the OS at one time. */
export const REMINDER_NOTIFICATION_LIMIT = MAX_PENDING_PRAYER_NOTIFICATIONS;
