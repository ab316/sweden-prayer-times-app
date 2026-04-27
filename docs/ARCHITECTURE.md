# Architecture

This is the canonical architecture document for `sakinah-bloom`. Two audiences:

1. **Humans** joining the project — read top to bottom to understand how the app is shaped.
2. **AI coding agents** (Claude Code, Codex) — read this **after** [`design/PRD.md`](../design/PRD.md) and [`design/Design.md`](../design/Design.md) so product intent and visual design constrain technical choices.

The doc has two halves:

- **Strategic** — what the app *is*: domain language, feature areas, key boundaries, decisions that rarely change.
- **Tactical** — how the code is *organized*: layering, folder shape, patterns the agent should follow when adding code.

If you propose a change that violates anything here, write an [ADR](./adr/) instead of silently deviating.

---

## Strategic

### Shape

A **client-only React Native app** built on Expo SDK 54 + Expo Router. **There is no backend we own.** The app reaches out directly to public APIs from the device. State is local to the device; nothing is synced to a server. This is an explicit decision (recorded as an ADR when the first server-needing feature is proposed).

Consequences this shape forces:

- **Offline is a first-class state**, not an afterthought. Cached data must be usable when the network is gone.
- **No user accounts.** Settings live in device storage. Multi-device sync is out of scope until the first ADR overrides this.
- **No server-pushed notifications.** Reminders are *local* notifications scheduled by the device.
- **Secrets live in code** (none of the integrations require auth keys we'd hide). If an integration is added that does need a key, write an ADR before adding it — that's a strategic shift.

### Domain language (ubiquitous)

Use these terms consistently in code, types, and UI copy. Don't introduce synonyms.

| Term | Meaning |
| --- | --- |
| **Prayer** | One of the five daily salah: `Fajr`, `Dhuhr`, `Asr`, `Maghrib`, `Isha`. Plus `Sunrise` (informational, not a prayer) and optionally `Imsak` (pre-Fajr) when the user enables it. |
| **PrayerSchedule** | The set of prayers for a single day at a single location, with computed times. |
| **Location** | A pair of `{ lat, lng }` plus a resolved human-readable city name. May be device-derived or user-entered. |
| **CalculationMethod** | The fiqh method used to compute prayer times (e.g. *Muslim World League*, *Diyanet*, *ISNA*). User-selectable; defaults per region. |
| **Madhab** | School of jurisprudence affecting Asr time (`Shafi` or `Hanafi`). User-selectable. |
| **Reminder** | A scheduled local notification tied to a specific prayer. May fire as a *pre-alert* (configurable offset, e.g. *15 min before Maghrib*) or *at-time*, optionally with the Adhan sound. |
| **Qibla** | Direction to the Kaaba in Mecca, computed from the device's location and compass heading. |

When a Stitch screen, the PRD, or an external API uses different terminology, **map it to the terms above** and call out the mapping in your response.

### Feature areas

The client decomposes into five loosely-coupled feature areas, derived from the screen list in [`design/PRD.md`](../design/PRD.md). Treat each as a folder under `features/<area>/` with its own screens, hooks, and types. Cross-area dependencies go through narrow, named interfaces — not by importing internal files.

```
features/
├── schedule/        ← fetching, caching, displaying prayer times; date navigation
├── location/        ← resolving device location, manual city selection (Swedish cities)
├── qibla/           ← compass-based Qibla direction finder
├── reminders/       ← scheduling local notifications per prayer (incl. pre-alerts and Adhan)
└── settings/        ← preferences: calculation method, madhab, reminder offsets, Adhan choice
```

The **About** screen called out in the PRD is a static info screen and lives directly at `app/about.tsx` — it doesn't earn its own feature folder.

Generic UI primitives that aren't tied to a feature live in [`components/`](../components/). Generic hooks (theming, color scheme) live in [`hooks/`](../hooks/).

### Cross-cutting concerns

- **Offline-first.** Every screen that depends on remote data must work from cache when offline. Show the cache age, not a blank screen.
- **Time & date.** All times are stored as ISO 8601 strings in UTC; converted to the user's timezone for display only. Use a single library (TBD — likely `date-fns`; pick on first use and don't mix).
- **Internationalisation.** The app's primary locale is **Swedish** (per the PRD). English and Arabic prayer names are likely additions. Don't introduce an i18n framework until the first localised string lands; until then, copy lives in source. When the framework is picked, write an ADR.
- **Accessibility.** All interactive elements need `accessibilityLabel`. Color contrast follows the tokens in `Design.md`. Verify with a screen-reader pass before declaring a screen complete.
- **Theming.** Light/dark via the system color scheme; honored by NativeWind `dark:` variants. Tokens come from `Design.md` and live in `tailwind.config.js`.

---

## Tactical

### Layering

Code is organised into four conceptual layers. A higher layer may depend on a lower one; never the reverse.

```
┌─────────────────────────────────────────────────┐
│  UI                Expo Router screens,         │
│                    NativeWind-styled components │
├─────────────────────────────────────────────────┤
│  Feature hooks     use<Thing>() — handle        │
│                    loading / error / cache      │
├─────────────────────────────────────────────────┤
│  Integration       lib/api/<service>.ts —       │
│                    typed wrapper around fetch   │
├─────────────────────────────────────────────────┤
│  Persistence       lib/storage/* —              │
│                    AsyncStorage / SecureStore   │
└─────────────────────────────────────────────────┘
```

Rules:

- **UI components never call `fetch`.** They call hooks.
- **Hooks never know about HTTP details.** They consume integration clients.
- **Integration clients never touch React.** They are pure async functions returning typed domain objects (not vendor response shapes — map at the boundary).
- **Persistence is hidden behind named helpers** (`saveSettings`, `loadCachedSchedule`), not raw `AsyncStorage.getItem` calls scattered through the app.

### Folder structure

```
app/                       ← Expo Router routes (screens)
  (tabs)/                  ← tabbed root
  ...
components/                ← generic, feature-agnostic UI
  ui/                      ← lowest-level primitives (existing)
features/                  ← feature-scoped code
  <feature>/
    screens/               ← optional: feature-specific screen helpers
    hooks/                 ← use<Feature>(), useFeatureSetting()
    types.ts               ← domain types for the feature
    index.ts               ← public exports (cross-feature uses *only* these)
hooks/                     ← generic reusable hooks (existing)
lib/
  api/                     ← external API clients
    aladhan.ts
    ...
  storage/                 ← persistence helpers
  notifications/           ← local-notification scheduling helpers
  time/                    ← shared date/time utilities
constants/                 ← app-wide constants (existing theme.ts lives here)
design/                    ← Stitch artifacts (read-only, see design/README.md)
docs/                      ← this folder
```

Don't create empty folders ahead of need. Add each one when its first real file lands. ADR if you add a top-level folder not on this list.

### Patterns

**Data fetching** — one client per service in `lib/api/<service>.ts`. The client returns domain types, never raw API response shapes. Each feature has a hook (`useSchedule`, `useLocation`) that wraps the client with `useState`-driven loading/error and integrates with the cache.

**Caching** — schedule data and reverse-geocoding results are cached via `lib/storage/`. Cache reads are synchronous-feeling (resolve immediately if present), then the hook revalidates in the background. Cache entries carry a timestamp; the UI may show "Updated 2h ago" using it.

**Errors** — never throw out of a render. Hooks expose `{ data, error, loading, refresh }`. Errors fall into two buckets:
- *Network or transient* — show cached data + a retry affordance.
- *Programmer error or invalid data* — log, show a generic "Something went wrong" with a "Report" link (file an issue / open mail), don't pretend it's fine.

**State** — start with `useState` and `useReducer` inside features. Lift to React Context only when 3+ unrelated screens need the same state. Don't introduce Zustand / Redux / Jotai without an ADR — premature.

**Permissions** — location, notifications, camera (Qibla compass eventually), etc. are requested *just-in-time* at the moment of feature use, not on app launch. Each feature owns its permission prompt.

**Navigation** — Expo Router file-based routing only. Tab structure mirrors the four feature areas where it makes sense (Schedule, Location/Qibla, Reminders, Settings). No imperative navigation libraries on top.

**Styling** — NativeWind classes only. No inline `StyleSheet.create` for new screens (existing `themed-text.tsx` / `themed-view.tsx` may keep their `StyleSheet`; don't rewrite them without reason). Hex values live in `tailwind.config.js` — *never* inline.

**Testing** — TBD. No test framework chosen yet. When the first test is written, pick (Jest + React Native Testing Library is the default) and write an ADR.

### What an AI agent does when adding code

1. Read [`design/PRD.md`](../design/PRD.md) and [`design/Design.md`](../design/Design.md) for product + visual context.
2. Identify which **feature area** the code belongs to (or whether it's truly generic).
3. Place files following the folder structure above. If a folder doesn't exist yet, create it — but only the one you need.
4. Use existing primitives ([`themed-text.tsx`](../components/themed-text.tsx), [`themed-view.tsx`](../components/themed-view.tsx), [`use-theme-color.ts`](../hooks/use-theme-color.ts)) for legacy template screens; for new Stitch-imported screens, use NativeWind classes directly.
5. If integrating an external API, consult [`docs/INTEGRATIONS.md`](./INTEGRATIONS.md) — do not invent a new pattern.
6. If the change makes a *non-obvious* architectural choice (new dependency, new top-level folder, deviation from any rule above), write an ADR in [`docs/adr/`](./adr/) using the template.

---

## Glossary of "TBD pending need"

These are intentionally undecided. The agent must not pre-emptively introduce them. The first PR that *needs* one writes an ADR alongside the implementation.

- Date/time library (`date-fns` vs `dayjs` vs Temporal polyfill)
- i18n framework
- Test framework
- State management beyond Context
- Analytics / telemetry
- Crash reporting
- Anything resembling a backend
