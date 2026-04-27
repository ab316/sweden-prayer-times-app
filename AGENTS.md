# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, others) working in this repo.

## Project

`sakinah-bloom` — a Sweden prayer-times app. Stack:

- **Expo SDK 54** + **Expo Router** (file-based routing in `app/`)
- **TypeScript**, strict mode, `@/*` path alias to repo root
- **NativeWind v4** (Tailwind CSS classes for React Native via `className` prop)
- React 19, React Native 0.81

Entry point: `app/_layout.tsx` (imports `global.css` to load Tailwind).

This is a **client-only app**. There is no backend we own. The app calls public APIs directly from the device. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full rationale.

## Required reading (in order)

Before implementing anything, an agent must skim these in order. They are sized to fit in one read each.

1. [`design/PRD.md`](design/PRD.md) — **what** the app is and **why** it exists. Product intent, target audience, screen inventory, success criteria. Sourced from Stitch.
2. [`design/Design.md`](design/Design.md) — design system: colors, typography, spacing, navigation, component patterns. Sourced from Stitch.
3. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — **how** the codebase is shaped: strategic (domain, feature areas) and tactical (layering, folder structure, patterns).
4. [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) — **only when touching external API code**. Catalog of every API the app talks to, plus shared rules.
5. [`docs/adr/`](docs/adr/) — open-and-skim if your change touches an area where decisions have been recorded.

If two of these disagree, the order above is also the precedence order: PRD > Design.md > ARCHITECTURE.md > INTEGRATIONS.md. Surface conflicts; do not silently pick one.

## Stitch → React Native workflow

UI is designed in **Google Stitch** and implemented here by an AI agent. Stitch produces three artifacts:

| File | Scope | Source of truth for |
| --- | --- | --- |
| `design/PRD.md` | App-wide | Product intent, target audience, screen inventory |
| `design/Design.md` | App-wide | Design system (colors, typography, spacing), navigation |
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

## When to write an ADR

Write an ADR in [`docs/adr/`](docs/adr/) (using [`0001-template.md`](docs/adr/0001-template.md)) **before** committing any of the following:

- A new dependency that affects more than one feature.
- A new top-level folder not listed in [`ARCHITECTURE.md` § Folder structure](docs/ARCHITECTURE.md#folder-structure).
- Any deviation from a rule in `ARCHITECTURE.md` or `INTEGRATIONS.md`.
- Picking one of the items in [`ARCHITECTURE.md` § *Glossary of TBD pending need*](docs/ARCHITECTURE.md#glossary-of-tbd-pending-need) (date library, i18n, test framework, state mgmt, analytics, crash reporting, backend).
- A new external integration, especially one needing auth/secrets.

The ADR ships in the same PR as the code that requires it. Don't merge the change without the ADR. See [`docs/adr/README.md`](docs/adr/README.md) for the workflow.

## What NOT to do

- Don't restyle screens beyond what Stitch produced unless explicitly asked.
- Don't pre-emptively add state management, data fetching, or business logic that wasn't in the PRD, `Design.md`, or the HTML.
- Don't skip the required reading even when only one screen is being implemented.
- Don't edit files inside `design/` — they are inputs from Stitch, not work product. If a token is missing or wrong, add it to `tailwind.config.js` and call out the discrepancy in your response.
- Don't introduce a new styling system (Tamagui, Unistyles, etc.) — NativeWind is the choice.
- Don't introduce a backend, server, or BaaS — this is a client-only app by design. Adding one needs an ADR (and a strong reason).
- Don't generate documentation files (`spec.md`, `props.md`, etc.) unless asked. ADRs are the exception — write those when the rules above require it.

## Useful commands

- `npm install` — install deps.
- `npx expo start --web` — Metro + web preview (fastest for visual verification).
- `npx expo start --ios` / `--android` — native simulators.
- `npx tsc --noEmit` — type-check the whole project.
- `npm run lint` — ESLint.
