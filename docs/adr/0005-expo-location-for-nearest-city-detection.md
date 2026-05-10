# 0005. Use Expo Location for nearest-city detection

- **Status:** Accepted
- **Date:** 2026-05-02
- **Deciders:** Abdullah Baig

## Context

The Location screen needs a real "Detect My Location" flow: ask the phone for current latitude/longitude, compare those coordinates with the bundled Swedish city registry, and set the nearest city as the current app location. This selected location drives multiple features: Prayer Times, Settings, and Qibla.

Expo SDK 54 includes `expo-location` as the first-party foreground location library. The app only needs one foreground position lookup after a user taps the button; it does not need background tracking, geofencing, or a backend.

## Decision

We will use `expo-location` for foreground device location. The Location feature will request foreground permission just-in-time from the Detect My Location button, call `getCurrentPositionAsync`, map the returned coordinates to the nearest bundled city, and pass that city through the existing shared `useLocation` selection flow.

Nearest-city matching stays client-side against the bundled city data. Distance is computed with the Haversine formula so longitude differences are weighted correctly across Sweden's latitudes.
