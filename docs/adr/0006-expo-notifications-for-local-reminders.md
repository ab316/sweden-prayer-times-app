# 0006. Use Expo Notifications for local reminders

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Abdullah Baig

## Context

The reminders feature needs to notify users at prayer time for enabled prayers. The product brief calls this "Notifications & Alerts", and the architecture explicitly states that reminders are local notifications scheduled by the device, with no server-pushed notifications or backend.

The integration catalog already names Expo Notifications as the local-notification integration. The app is Expo SDK 54, and Expo Notifications is the first-party API for scheduling one-shot local notifications on iOS and Android.

## Decision

We will use `expo-notifications` for prayer reminders. Reminders are scheduled as one-shot local notifications from bundled prayer schedule data. On app launch, city changes, and reminder setting changes, the app cancels existing scheduled notifications and rebuilds the next seven days of enabled prayer reminders.

For the first implementation:

- `Sunrise` is not schedulable.
- Reminder settings are enabled by default for the five daily prayers.
- Each enabled prayer schedules one notification at prayer time.
- Adhan means the platform default notification sound.
- Notification copy matches the current English UI.

## Alternatives considered

- Remote push notifications: rejected because the app is client-only and has no backend or accounts.
- Repeating daily notifications: rejected because prayer times shift daily, so one-shot date triggers rebuilt from schedule data are more accurate.
- Custom Adhan audio now: rejected for v1 because the requested behavior is the platform default sound.

## Consequences

- **Positive:** reminders work offline once scheduled and follow the client-only architecture.
- **Positive:** the schedule rebuild path keeps city changes and prayer-time changes reflected in future notifications.
- **Negative / costs:** real notification behavior must be verified on iOS and Android devices; web preview can only verify UI and no-op paths.
- **Neutral but worth knowing:** future pre-alerts and custom Adhan audio can extend the same scheduling helper without changing the feature boundary.
