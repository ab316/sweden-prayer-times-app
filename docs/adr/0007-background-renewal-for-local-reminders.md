# 0007. Use background task renewal for local reminders

- **Status:** Accepted
- **Date:** 2026-05-15
- **Deciders:** Abdullah Baig

## Context

Prayer reminders are local one-shot notifications. The previous implementation rebuilt the next
set of reminders from UI hooks, which meant renewal was tied to screens being mounted. The product
goal is that users should not need to visit Settings, or any specific screen, to keep reminders
registered.

Android scheduling must also stay below 50 pending prayer notifications at a time.

## Decision

We will use `expo-background-task` with `expo-task-manager` as a best-effort renewal path. The app
will still rely on rolling one-shot local notifications as the primary reliability model, with
renewal triggered on app launch, app foreground, location changes, reminder setting changes, a daily
in-app timer, and the background task.

The scheduler will persist metadata for the current reminder schedule and rebuild when the stored
coverage is near expiry, or when city/settings changed. Android exact alarm permission is declared
so Expo Notifications can use exact alarms where Android allows it; if Android does not allow exact
alarms, Expo Notifications falls back to inexact alarms.

## Consequences

- **Positive:** reminder renewal is no longer dependent on visiting Settings.
- **Positive:** the OS never receives more than 50 pending prayer reminders from the app.
- **Positive:** background work can extend reminder coverage when the OS allows it.
- **Negative / costs:** background execution is best effort and must not be treated as guaranteed.
- **Negative / costs:** real reliability and exactness still require Android device testing across
  notification permission, exact alarm permission, app standby, and reboot/update scenarios.
