# Integrations

Catalog of every external API or platform integration the app talks to, plus the patterns that apply to all of them.

Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) before this file. Generated prayer data is produced outside the runtime app and then served or bundled for app consumption.

---

## Common rules

1. **Map at the boundary.** Vendor response shapes must not leak into app feature code.
2. **Cache on the way in.** Successful runtime responses are cached behind named storage helpers. Generator source responses are cached in files.
3. **Network failure is normal.** Runtime features must have an offline path where possible.
4. **No secrets in the app.** Awqat credentials are generator-only and never bundled into the React Native app.
5. **Rate limits matter.** Document and respect them per integration.
6. **Timezones.** Display times in the user's local timezone. Generated Awqat schedules preserve source date/time fields for audit.

---

## 1. Expo Location

**Purpose:** resolve the device's position and city name.

**Docs:** https://docs.expo.dev/versions/latest/sdk/location/

**Runtime integration:** on-device API; reverse geocoding may use OS network services.

### What we use

| API | Purpose |
| --- | --- |
| `Location.requestForegroundPermissionsAsync()` | Permission prompt, requested only when the user opts into location. |
| `Location.getCurrentPositionAsync({ accuracy: Balanced })` | One-shot lat/lng. |
| `Location.reverseGeocodeAsync({ latitude, longitude })` | Human-readable city/region name. |

### Caching and offline behavior

- Persist the resolved `Location` to `lib/storage/` so subsequent launches do not re-prompt.
- GPS position can work offline; reverse geocoding may fail offline.
- If reverse geocoding fails, keep lat/lng and retry name resolution later.

---

## 2. Expo Notifications (local)

**Purpose:** schedule prayer reminders as local notifications. No remote push server is used.

**Docs:** https://docs.expo.dev/versions/latest/sdk/notifications/

### What we use

| API | Purpose |
| --- | --- |
| `Notifications.requestPermissionsAsync()` | Request permission when the user enables their first reminder. |
| `Notifications.scheduleNotificationAsync({ content, trigger })` | Schedule one-shot prayer reminders. |
| `Notifications.cancelScheduledNotificationAsync(id)` | Cancel one scheduled reminder. |
| `Notifications.cancelAllScheduledNotificationsAsync()` | Clear and rebuild the reminder schedule. |

### Scheduling pattern

Because prayer times shift daily, reminders are rebuilt from generated/cached schedule data:

1. On app launch and once per day, load the next 7 days of prayer schedules for the current location.
2. Cancel existing scheduled notifications.
3. Schedule enabled reminders as one-shot `Date` triggers.

### Offline behavior

Local notifications do not need network. The only data dependency is prayer schedules, which should come from bundled/generated data or local cache.

---

## 3. Awqat Salah + Nominatim Prayer Data Generator

**Purpose:** generate storage-neutral Swedish city and yearly prayer-time JSON for the app/API layer.

**Nominatim docs:** https://nominatim.org/release-docs/latest/api/Search/

**Nominatim usage policy:** https://operations.osmfoundation.org/policies/nominatim/

**Decision record:** [`0003-generate-prayer-data-from-awqat-salah-and-nominatim.md`](./adr/0003-generate-prayer-data-from-awqat-salah-and-nominatim.md)

**Runtime behavior:** generated data is intended to be served by the app's eventual data API or static asset host. The React Native app should not call Awqat Salah or Nominatim directly.

### Sources

| Source | Purpose | Auth |
| --- | --- | --- |
| Awqat Salah / Diyanet | Supported Sweden city ids and yearly prayer times | Generator login via `POST /Auth/Login`; token returned at `data.accessToken` |
| Nominatim / OpenStreetMap | Resolve each Awqat city into display name, type, and coordinates | None; requires identifying User-Agent and max 1 request/second |

### Endpoints used

| Endpoint | When | Notes |
| --- | --- | --- |
| `POST /Auth/Login` | Before Awqat calls | Credentials come from `AWQAT_USERNAME` and `AWQAT_PASSWORD`. Field names can be overridden with `AWQAT_USERNAME_FIELD` / `AWQAT_PASSWORD_FIELD`. |
| `GET /api/Place/Countries` | Resolve Sweden | Requires `code === "SWEDEN"`. |
| `GET /api/Place/States/{countryId}` | Resolve Sweden state id | The generator currently requires exactly one Sweden state. |
| `GET /api/Place/Cities/{stateId}` | Fetch Awqat-supported Sweden cities | This is the app-facing coverage set. |
| `POST /api/PrayerTime/DateRange` | Fetch one city/year | Body is `{ cityId, startDate, endDate }` with ISO date strings. |
| `GET https://nominatim.openstreetmap.org/search` | Resolve one Awqat city name | Uses `q=<awqat city>, Sweden`, `countrycodes=se`, `format=jsonv2`, `addressdetails=1`, `namedetails=1`, and `limit=5`. |

### Generated data strategy

- Script: `scripts/generate-prayer-data.mjs`.
- Command: `npm run generate:prayer-data -- --year 2026`.
- Default output: `features/schedule/data/prayer-data/`.
- Source API cache: `.cache/prayer-data/source-api/` by default.
- Cache controls: `--refresh-cache`, `--no-cache`, and `--cache-dir <dir>`.
- Generated files:
  - `cities.json` as `Location[]`: `{ awqatCityId, awqatName, displayName, type, lat, lng, source }`.
  - `years/{year}/cities/{awqatCityId}.json` for each resolved city's yearly prayer schedule.
  - `manifest.json` for schema version, source ids, counts, and checksums.

### Location resolution strategy

The generator searches Nominatim once per Awqat city using the normalized city name plus `Sweden`, then selects the best result by OSM category/type and importance. It maps Nominatim results to `city`, `municipality`, `locality`, or `area`. Unresolved locations are logged and omitted from `cities.json` and schedule generation.

### Manual verification for live refreshes

Before accepting regenerated data, confirm:

- Sweden country resolved from Awqat by `code === "SWEDEN"`.
- Exactly one Sweden state resolved.
- The expected Awqat Sweden city count was fetched.
- Any unresolved city logs are reviewed and accepted.
- `cities.json` is an array of objects matching the `Location` shape.
- Every generated city-year schedule has 365 or 366 daily rows.

---

## Adding a new integration

1. Open an ADR in [`adr/`](./adr/) explaining what is being integrated, why, and which alternatives were considered.
2. Add a section to this file using the same shape: purpose, docs, auth, endpoints, caching/offline behavior, and domain mapping.
3. Create a typed integration client or generator adapter.
4. Wire runtime integrations through feature hooks or storage helpers; do not call them directly from UI components.
5. Update [`ARCHITECTURE.md`](./ARCHITECTURE.md) if the integration changes the app shape.
