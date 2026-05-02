# 0004. Use AsyncStorage for client persistence

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** Abdullah Baig

## Context

Three features need to persist small amounts of state across app launches:

- `features/location` — selected city + recently used cities
- `features/reminders` — per-prayer notification toggles + global on/off
- (future) `features/settings` — additional preferences when they're added

The architecture (see [`docs/ARCHITECTURE.md` § Tactical → Layering](../ARCHITECTURE.md)) requires a dedicated **Persistence** layer, with raw storage calls hidden behind named helpers in `lib/storage/`. The architecture also lists "anything resembling a backend" under [§ Glossary of TBD pending need](../ARCHITECTURE.md) — this is a client-only app with no server-side state.

The values stored are:

- Tiny (a few KB at most).
- Non-sensitive (city name, lat/lng, on/off flags).
- Read once at hook init; written eagerly on user input.
- Tolerant of best-effort persistence (a lost write is recoverable; the user just re-toggles).

[`AGENTS.md` § When to write an ADR](../../AGENTS.md) requires an ADR for any new dependency that affects more than one feature; this dep does (location, reminders, future settings).

## Decision

We will use **`@react-native-async-storage/async-storage`** as the only persistence backend, accessed exclusively through helpers in [`lib/storage/`](../../lib/storage/index.ts). Features must not import `AsyncStorage` directly.

Concretely:

- One module — `lib/storage/index.ts` — owns the `AsyncStorage` import and exposes named helpers (`loadSelectedCity`, `saveSelectedCity`, `loadRecentCities`, `pushRecentCity`, `loadReminderSettings`, `saveReminderSettings`, `clearAll`).
- Storage keys live in a private `STORAGE_KEYS` constant, not as raw strings sprinkled through call sites.
- All values are JSON-encoded; helpers are typed with the feature's domain types (`City`, `ReminderSettings`).
- Hooks consuming storage hydrate on mount and expose a `hydrated` flag; UI may render defaults pre-hydration.

## Alternatives considered

- **`expo-secure-store`** — designed for secrets (Keychain / KeyStore-backed). Overkill and slower for non-sensitive prefs; size-limited per-item; rejected.
- **`expo-sqlite`** — relational store with migration story. Far more capacity than we need; introduces schema management for what is currently three flat values; rejected as premature.
- **`react-native-mmkv`** — synchronous, faster than AsyncStorage, but requires a config plugin and pulls a native binary; the perf delta is invisible at our payload sizes; rejected as not worth the build complexity.
- **In-memory only (no persistence)** — would force users to re-pick their city on every cold launch and re-toggle reminders. Unacceptable UX; rejected.

## Consequences

- **Positive**
  - Smallest footprint that satisfies the architecture's persistence layer.
  - Works on web (via `localStorage` shim baked into AsyncStorage), iOS, and Android — useful for the `expo start --web` verification path.
  - Async API discourages reading on every render; lines up naturally with the hydrate-on-mount pattern.
  - Trivial to swap later: every consumer goes through `lib/storage`, so we can replace the backend without touching features.
- **Negative / costs**
  - Async means UI must handle a brief pre-hydration window (defaults shown until storage resolves). All hooks expose `hydrated` to make this explicit.
  - Not encrypted at rest. If we ever add anything sensitive (auth tokens, user PII), that must use SecureStore — not this module.
  - One more native module in the dependency surface; reflected in `package.json`.
- **Neutral but worth knowing**
  - Web preview uses the localStorage backend; persistence behavior is observable in DevTools → Application → Local Storage.
  - When real geolocation is wired (`expo-location`) or local notifications (`expo-notifications`), they will need their own ADRs — they're separate decisions.
