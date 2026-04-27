# 0002. Adopt @expo-google-fonts for Noto Serif and Manrope

- **Status:** Accepted
- **Date:** 2026-04-27
- **Deciders:** Abdullah Baig

## Context

[`design/Design.md`](../../design/Design.md) names **Noto Serif** (display, headlines, prayer names) and **Manrope** (body, labels, utility data) as load-bearing brand assets for the *Sakinah Bloom* design system. The dual-font strategy is core to the visual identity — Noto Serif provides "the soul of the interface" (tradition, authority); Manrope is "the functional workhorse" (legibility at glance). Falling back to platform defaults (system serif / sans) loses the editorial character the design is built around.

[`AGENTS.md`](../../AGENTS.md) requires an ADR for "a new dependency that affects more than one feature." These fonts will be used across every screen, so an ADR lands now alongside the first screen that consumes them (the Prayer Times dashboard).

## Decision

We will use `@expo-google-fonts/noto-serif` and `@expo-google-fonts/manrope` as the source of these two font families. Fonts are loaded once in [`app/_layout.tsx`](../../app/_layout.tsx) via `useFonts` from `expo-font` (already a transitive dependency of the project). Render is gated on `fontsLoaded`; until the gate flips, the layout returns `null` (the splash screen stays up).

The loaded weight set, chosen against the type scale in `Design.md`:

- **Noto Serif:** `400Regular`, `500Medium`, `600SemiBold`, `600SemiBold_Italic`, `700Bold`.
- **Manrope:** `400Regular`, `500Medium`, `600SemiBold`, `700Bold`.

The `tailwind.config.js` `fontFamily` map references these weights by their `@expo-google-fonts` export name (e.g. `NotoSerif_700Bold`), which is the family name React Native's font registry uses.

## Alternatives considered

- **Platform-default serif / sans (`ui-serif`, `system-ui`).** Free, zero deps. Rejected: the design system explicitly calls Noto Serif and Manrope load-bearing brand assets — system fonts vary across iOS, Android, and web, making the "premium craftsmanship" feel `Design.md` aims for impossible to deliver consistently.
- **Self-hosting `.ttf` files in `assets/fonts/`.** Avoids a new package. Rejected: more files to vendor, more weights to manage manually, and we lose the centralized version updates `@expo-google-fonts` provides. The bundled file approach is preferable only if we later need to ship the app fully offline-installable; we're not there yet.
- **`expo-font` API directly with Google Fonts URLs.** Avoids the `@expo-google-fonts/*` wrapper. Rejected: the wrapper provides typed exports and pre-bundled font files (so the fonts resolve offline once installed); it adds negligible cost on top of `expo-font`.

## Consequences

- **Positive.** All headlines render in Noto Serif and all body text in Manrope, matching the design exactly across iOS, Android, and web. Type scale tokens in `tailwind.config.js` map cleanly to a real font family. Future screens get the right typography for free via NativeWind classes (`font-display-lg`, `font-headline-md`, etc.).
- **Negative / costs.** Two new top-level dependencies (`@expo-google-fonts/noto-serif`, `@expo-google-fonts/manrope`). Bundle size increases by the loaded weight set (~9 font files). Adding a new weight requires editing both `app/_layout.tsx` (the `useFonts` call) and `tailwind.config.js` (the `fontFamily` map) — two-place change, easy to miss one half.
- **Neutral but worth knowing.** First-render is gated on `fontsLoaded`; on slow devices this can briefly extend the splash screen. If that becomes a perceptible issue, fall back to `expo-splash-screen`'s `preventAutoHideAsync` / `hideAsync` pattern to give finer control. New weights/styles needed in the future should be added to the `useFonts` call *and* the corresponding NativeWind class in `tailwind.config.js`.
