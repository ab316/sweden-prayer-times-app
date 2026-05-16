import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { ensureReminderScheduleFresh } from './reminders';

const REMINDER_BACKGROUND_TASK = 'renew-prayer-reminders';
const BACKGROUND_TASK_MIN_INTERVAL_MINUTES = 12 * 60;

/** Defines the native background task at module scope so Expo can run it headlessly. */
if (Platform.OS !== 'web' && !TaskManager.isTaskDefined(REMINDER_BACKGROUND_TASK)) {
  TaskManager.defineTask(REMINDER_BACKGROUND_TASK, async () => {
    try {
      await ensureReminderScheduleFresh();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

/** Registers the best-effort reminder renewal task when the platform allows background work. */
export async function registerReminderBackgroundTask() {
  if (Platform.OS === 'web') return;

  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;

  const registered = await TaskManager.isTaskRegisteredAsync(REMINDER_BACKGROUND_TASK);
  if (registered) return;

  await BackgroundTask.registerTaskAsync(REMINDER_BACKGROUND_TASK, {
    minimumInterval: BACKGROUND_TASK_MIN_INTERVAL_MINUTES,
  });
}
