# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, others) working in this repo.

## Project

`sakinah-bloom` — a Sweden prayer-times app. Stack:

- **Expo SDK 54** + **Expo Router** (file-based routing in `app/`)
- **TypeScript**, strict mode, `@/*` path alias to repo root
- **NativeWind v4** (Tailwind CSS classes for React Native via `className` prop)
- React 19, React Native 0.81

Entry point: `app/_layout.tsx` (imports `global.css` to load Tailwind).

## Stitch → React Native workflow

UI is designed in **Google Stitch** and implemented here by an AI agent. Two design artifacts come from Stitch:

| File | Scope | Source of truth for |
| --- | --- | --- |
| `design/Design.md` | App-wide | Design system (colors, typography, spacing), navigation, screen inventory |
| `design/screens/<screen-name>/stitch.html` | Per screen | Layout, Tailwind class names, copy, structure |

The 6-step loop:

1. The user designs/updates screens in Stitch.
2. If the **design system** changed, the user re-exports `Design.md` from Stitch and overwrites `design/Design.md`.
3. For each screen to implement, the user pastes Stitch's "Get code" HTML into `design/screens/<screen-name>/stitch.html`.
4. The user prompts the agent: *"implement design/screens/<screen-name>"*.
5. The agent reads `design/Design.md` first (global context, tokens), then the per-screen HTML.
   - If `Design.md` introduced new tokens (colors, spacing, fonts) **not yet in `tailwind.config.js`**, the agent reconciles `tailwind.config.js` against `Design.md` **before** implementing the screen.
6. The agent generates the screen at the matching Expo Router route, extracts reusable components, and runs `npx expo start --web` to verify the screen renders.

If `Design.md` and the HTML disagree: `Design.md` wins for intent, the HTML wins for structure. Surface the conflict in your response.

## HTML → React Native element mapping

| HTML | React Native |
| --- | --- |
| `<div>` | `<View>` |
| `<p>`, `<span>`, `<h1>`–`<h6>` | `<Text>` (preserve heading sizes via Tailwind `text-*`) |
| `<img>` | `<Image>` from `expo-image` |
| `<a href>` (internal) | `<Link>` from `expo-router` |
| `<a href>` (external) | `ExternalLink` from `components/external-link.tsx` |
| `<button>` | `<Pressable>` with `onPress` |
| `<input>`, `<textarea>` | `<TextInput>` |
| `<svg>` (icons) | `@expo/vector-icons` if it matches; else `react-native-svg` |
| `<ul>`, `<ol>` (long lists) | `<FlatList>`; for short static lists, mapped `<View>`s are fine |

## Class translation rules

- Tailwind classes carry over verbatim onto `className`. NativeWind handles them.
- Drop or substitute web-only classes:
  - `cursor-*`, `select-*` → drop (no-op on native).
  - `hover:*` → drop, or convert to a pressed-state pattern with `Pressable`'s `style={({ pressed }) => ...}` if the design clearly intends a hover affordance.
  - `transition-*`, `duration-*` (CSS transitions) → use `react-native-reanimated` (already a dep) when motion matters; otherwise drop.
- `dark:*` variants are honored by NativeWind via the system color scheme. Keep them.

## Output locations

- **Screen routes** → `app/...` matching the screen name. Kebab-case in `design/`, kebab-case in `app/`. E.g. `design/screens/prayer-times/` → `app/(tabs)/prayer-times.tsx` or `app/prayer-times/index.tsx` depending on whether it's tabbed.
- **Reusable pieces** (anything used >1×, e.g. cards, list items, buttons): extract to `components/<name>.tsx`.
- **New design tokens** (colors, spacing, fonts not in `tailwind.config.js`): add to `tailwind.config.js` `theme.extend`. **Do not hardcode hex values inline.**

## Theming guardrails

- The legacy theme in `constants/theme.ts` is the source for `<ThemedText>` / `<ThemedView>` (used by the existing template screens). Don't delete it.
- For Stitch-imported screens, prefer NativeWind's `dark:` variants driven from the `tailwind.config.js` palette over `<ThemedText>`/`<ThemedView>`.
- If `Design.md` defines tokens that overlap with `constants/theme.ts`, mirror them in `tailwind.config.js` so both worlds stay in sync. `Design.md` wins on conflict.

## Verification before declaring done

After implementing a screen the agent **must**:

1. Run `npx expo start --web` (or confirm it's already running).
2. Navigate to the new route in the browser preview.
3. Confirm the screen renders without Metro/Babel errors.
4. Note any platform-specific divergences (web vs. iOS/Android) in the response.

Type-checking and linting alone are not sufficient — the screen must actually render.

## What NOT to do

- Don't restyle screens beyond what Stitch produced unless explicitly asked.
- Don't pre-emptively add state management, data fetching, or business logic that wasn't in `Design.md` or the HTML.
- Don't skip `design/Design.md` even when only one screen is being implemented — it carries tokens and navigation context.
- Don't edit files inside `design/` — they are inputs from Stitch, not work product. If a token is missing or wrong, add it to `tailwind.config.js` and call out the discrepancy in your response.
- Don't introduce a new styling system (Tamagui, Unistyles, etc.) — NativeWind is the choice.
- Don't generate documentation files (`spec.md`, `props.md`, etc.) unless asked.

## Useful commands

- `npm install` — install deps.
- `npx expo start --web` — Metro + web preview (fastest for visual verification).
- `npx expo start --ios` / `--android` — native simulators.
- `npx tsc --noEmit` — type-check the whole project.
- `npm run lint` — ESLint.
