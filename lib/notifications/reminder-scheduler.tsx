import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useLocation } from '@/features/location';

import { registerReminderBackgroundTask } from './reminder-background-task';
import { ensureReminderScheduleFresh } from './reminders';

/** Returns the delay until the next just-after-midnight in-app renewal check. */
function millisecondsUntilNextDailyRenewal() {
  const now = new Date();
  const nextDay = new Date(now);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 5, 0);
  return nextDay.getTime() - now.getTime();
}

/** App-level component that keeps reminder registration fresh without screen-specific visits. */
export function ReminderScheduler() {
  const { city, hydrated } = useLocation();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [dailyTick, setDailyTick] = useState(0);

  useEffect(() => {
    void registerReminderBackgroundTask();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void ensureReminderScheduleFresh({ cityId: city.id });
  }, [city.id, hydrated, dailyTick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackgrounded = appState.current.match(/inactive|background/);
      appState.current = nextState;

      if (wasBackgrounded && nextState === 'active') {
        void ensureReminderScheduleFresh({ cityId: city.id });
      }
    });

    return () => subscription.remove();
  }, [city.id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDailyTick((value) => value + 1);
    }, millisecondsUntilNextDailyRenewal());

    return () => clearTimeout(timeout);
  }, [dailyTick]);

  return null;
}
