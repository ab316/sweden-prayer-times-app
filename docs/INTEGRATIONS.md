# Integrations

Catalog of every external API the app talks to, plus the patterns that apply to all of them.

The app is **client-only** — these calls happen from the device. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) before this file.

---

## Common rules

These rules apply to **every** integration. The agent must follow them when writing or modifying integration code.

1. **One client per service**, in `lib/api/<service>.ts` (or `lib/<service>/index.ts` if the integration spans multiple files). The client is a set of pure async functions — no React, no global state.
2. **Map at the boundary.** Vendor response shapes never leave the client. Functions return domain types defined in [`ARCHITECTURE.md`](./ARCHITECTURE.md#domain-language-ubiquitous) — `PrayerSchedule`, `Location`, etc.
3. **Cache on the way in.** Successful responses are written to `lib/storage/` keyed by request inputs. Failures don't evict cache.
4. **Network failure is normal.** Every client call must have a documented offline behavior — usually "return last cache entry" or "throw `NetworkUnavailable`."
5. **No secrets without an ADR.** If an integration starts requiring auth keys, that's a strategic shift — write an ADR before adding it.
6. **Rate limits matter.** Document them per integration (below) and add client-side throttling if the limit is tight.
7. **Timezones.** The device's local timezone is the source of truth for display. Cross-day boundaries (e.g. an Isha after midnight UTC) must round-trip cleanly.

---

## 1. Aladhan Prayer Times API

**Purpose:** compute daily prayer times for a given location.

**Docs:** https://aladhan.com/prayer-times-api

**Base URL:** `https://api.aladhan.com/v1`

**Auth:** none. Public API.

**Rate limits:** generous, no documented hard cap. Be polite — cache aggressively.

### Endpoints we use

| Endpoint | When | Notes |
| --- | --- | --- |
| `GET /timings/{date}?latitude=&longitude=&method=&school=` | One day, one location | `method` = calculation method (e.g. `3` = Muslim World League). `school` = madhab (`0` = Shafi, `1` = Hanafi). |
| `GET /calendar/{year}/{month}?latitude=&longitude=&method=&school=` | Whole month at once | Preferred for warming the cache; one call covers ~30 days of UI. |

We **prefer the monthly endpoint** for cache warming and fall back to per-day calls for ad-hoc lookups.

### Caching strategy

- Cache key: `prayer-schedule:<lat>:<lng>:<year>-<month>:<method>:<school>` (round lat/lng to 3 decimal places ≈ 100 m precision so nearby locations share a cache).
- TTL: **30 days**, but always serve stale-then-revalidate. Schedules don't change retroactively, so an old cache is still correct.
- Eviction: LRU on a 24-month rolling window. Anything older is purged on app launch.

### Offline fallback

If `fetch` rejects and a cache hit exists → return cache, mark response as `{ fresh: false, cachedAt }`. UI shows cache age.

If no cache → throw `NetworkUnavailable`. The screen shows "We can't reach the schedule service. Connect to the internet to download prayer times for your location."

### Domain mapping

Aladhan returns timings as `"HH:mm (TZ)"` strings. The client must:

1. Parse them in the device's local timezone.
2. Combine with the requested date to produce ISO 8601 instants.
3. Drop fields the app doesn't model (`Sunset`, `Midnight`, `Firstthird`, `Lastthird`) **unless** the PRD calls them out.

Output shape (illustrative — concrete TS types live in `features/schedule/types.ts` once created):

```ts
type PrayerSchedule = {
  date: string;            // ISO date, no time, e.g. "2026-04-27"
  location: Location;
  method: CalculationMethod;
  madhab: Madhab;
  prayers: {
    fajr: string;          // ISO 8601 instant in local TZ
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  fetchedAt: string;       // ISO 8601 instant, for "Updated Xh ago"
};
```

---

## 2. Expo Location

**Purpose:** resolve the device's position and city name.

**Docs:** https://docs.expo.dev/versions/latest/sdk/location/

**On-device API**, not a network call (though reverse-geocoding does hit OS services).

### What we use

| API | Purpose |
| --- | --- |
| `Location.requestForegroundPermissionsAsync()` | Permission prompt — call **at the moment the user opts into location**, not on app launch. |
| `Location.getCurrentPositionAsync({ accuracy: Balanced })` | One-shot lat/lng. `Balanced` is enough for prayer-time computation (~100 m). |
| `Location.reverseGeocodeAsync({ latitude, longitude })` | City/region name. Uses native OS service — no API key needed. |

We **do not** use background location tracking. The user's location is sampled when they open the app or explicitly refresh, not continuously.

### Permission flow

1. User opens the Location/Qibla feature for the first time → show a screen explaining why we need location → tap "Use my location" → Expo prompts.
2. If denied → fall back to **manual city entry**. The user can type a city; we resolve it via `Location.geocodeAsync` (reverse of reverse-geocoding) once and cache the lat/lng.
3. Persist the resolved `Location` to `lib/storage/` so subsequent launches don't re-prompt.

### Caching

- Cache key: `location:current`.
- Refresh: only when the user explicitly taps "Update location" or moves >5 km (we detect this opportunistically when they open the app, not via background tracking).

### Offline fallback

`getCurrentPositionAsync` works offline (GPS doesn't need network). `reverseGeocodeAsync` *may* fail offline — if it does, store the lat/lng without a city name and re-resolve when the network is back.

---

## 3. Expo Notifications (local)

**Purpose:** schedule prayer reminders as **local** notifications. No remote push, no server.

**Docs:** https://docs.expo.dev/versions/latest/sdk/notifications/

### What we use

| API | Purpose |
| --- | --- |
| `Notifications.requestPermissionsAsync()` | Permission prompt — request when the user enables their first reminder, not on launch. |
| `Notifications.scheduleNotificationAsync({ content, trigger })` | Schedule a notification. Trigger is a `Date` (one-shot) or a calendar trigger (recurring). |
| `Notifications.cancelScheduledNotificationAsync(id)` | Cancel one. |
| `Notifications.cancelAllScheduledNotificationsAsync()` | Nuke and re-schedule from scratch. |

### Scheduling pattern

Each `Reminder` (per [`ARCHITECTURE.md`](./ARCHITECTURE.md#domain-language-ubiquitous)) becomes one or more scheduled notifications. Because prayer times shift daily, we **reschedule on every app launch** and on midnight rollover:

1. On app launch (and once per day), compute the next 7 days of `PrayerSchedule` for the current location.
2. `cancelAllScheduledNotificationsAsync()`.
3. For each enabled `Reminder`, schedule notifications for the next 7 days using one-shot `Date` triggers.

7 days is well under the iOS pending-notification cap (64 per app). Background re-scheduling via a `BackgroundFetch` task is only needed if the user keeps the app cold for >7 days — until that's a real complaint, ignore it.

### Pre-alerts and Adhan sound

The PRD specifies two reminder modes per prayer:

- **Pre-alert** — fires N minutes before the prayer (user-configurable offset, e.g. 15 min). Default text-only system sound.
- **At-time, with Adhan** — fires at the prayer time and plays a bundled Adhan audio file as the notification sound.

Adhan audio files are **bundled assets** under `assets/sounds/adhan-*.mp3` and registered via Expo Notifications' `sound` field in the notification content. Adding a new Adhan recording means dropping the file into `assets/sounds/` and exposing it as a choice in the Settings screen — no integration change.

### Permission flow

1. User toggles "Reminder for Maghrib" → first time only, show a one-line explainer → permission prompt.
2. If denied → toggle bounces back, show a "Enable notifications in Settings" link.

### Offline behavior

Local notifications don't need network. Scheduling is purely on-device. The only network dependency is the *prayer times* needed to compute trigger times — that comes from Aladhan and is cached, so reminders work offline as long as we've fetched the schedule at least once.

---

## Adding a new integration

1. Open an ADR in [`adr/`](./adr/) explaining what we're integrating, why, and which alternatives were considered.
2. Add a section to this file using the same shape: purpose, docs, base URL, auth, rate limits, endpoints, caching, offline fallback, domain mapping.
3. Create `lib/api/<service>.ts` with typed pure functions.
4. Wire it through a feature hook, never call it directly from a UI component.
5. Update [`ARCHITECTURE.md`](./ARCHITECTURE.md#feature-areas) if the integration introduces a new feature area.
