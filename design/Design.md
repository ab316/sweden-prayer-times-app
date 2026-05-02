---
name: Sweden Prayer — Design System
version: 1.1.0
colors:
  # ── Active theme: Sage ──────────────────────────────────────────────────────
  # This is the only theme currently in use. See constants/theme.jsx.
  bg: '#f5ede4'
  card: '#ffffff'
  primary: '#2d5a42'
  primary-light: '#e8f0eb'
  accent: '#c8892a'
  accent-light: '#fdf3e3'
  text: '#1e2c24'
  text-sub: '#6b7c72'
  tab-bg: 'rgba(255,255,255,0.95)'
  current-row: '#fdf3e3'
  current-border: '#c8892a'

  # ── Reserved themes (not yet active — wired up when theme feature lands) ───
  # Rose theme
  _rose-bg: '#fdf0f3'
  _rose-primary: '#8b1a3a'
  _rose-primary-light: '#fde8ef'
  _rose-accent: '#c0395a'
  _rose-text: '#2a0e1a'
  _rose-text-sub: '#8a6070'
  # Slate theme
  _slate-bg: '#f0f2f5'
  _slate-primary: '#2c3e6b'
  _slate-primary-light: '#e8ecf5'
  _slate-accent: '#d4862a'
  _slate-text: '#1a2035'
  _slate-text-sub: '#6b7590'
typography:
  app-title:
    fontFamily: Lora
    fontSize: 20px
    fontWeight: '600'
    letterSpacing: -0.3px
    usage: App name in header
  display-lg:
    fontFamily: Lora
    fontSize: 42px
    fontWeight: '700'
    lineHeight: '1'
    usage: Next prayer name in hero card
  headline-xl:
    fontFamily: Lora
    fontSize: 28px
    fontWeight: '700'
    usage: Screen titles (Qibla, Settings, About)
  headline-md:
    fontFamily: Lora
    fontSize: 24px
    fontWeight: '700'
    usage: About screen app name, section headlines
  time-lg:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '500'
    letterSpacing: -0.5px
    usage: Next prayer time in hero card
  time-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '600'
    letterSpacing: -0.3px
    usage: Prayer time in list rows
  body-md:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '600'
    usage: Prayer names in list rows
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    usage: Settings rows, location list items
  label:
    fontFamily: DM Sans
    fontSize: 11-12px
    fontWeight: '600-700'
    letterSpacing: 1.2-1.5px
    textTransform: uppercase
    usage: Section headers, "NEXT", "CURRENT" badges
  caption:
    fontFamily: DM Sans
    fontSize: 12-13px
    fontWeight: '400-500'
    usage: Subtitles, Hijri date, city subtitle
rounded:
  tab-bar-icon-bg: 10px
  prayer-row: 14px
  hero-card: 20px
  settings-card: 16px
  about-app-icon: 20px
  city-chips: 20px
  toggle: 13px (pill)
  buttons: 8-14px
spacing:
  screen-padding: 20px
  header-padding: 24px
  card-padding: '16-24px'
  row-padding: '13-14px vertical, 16px horizontal'
  gap-between-rows: 8px
  gap-between-sections: 24px
---

## Brand & Style

**Sweden Prayer** bridges Scandinavian minimalism with Islamic spiritual tradition. The aesthetic is calm, precise, and warm — built around a soft off-white/cream background with deep green or burgundy primaries and warm amber/gold accents that highlight the current prayer.

The design philosophy is **Spiritual Precision**: every element earns its place. Heavy whitespace, tonal layering, and subtle depth replace decorative clutter. The interface should feel like a breath of fresh air, not a dashboard.

## Implemented Screens

### 1. Prayer Screen (Home)
- **Header**: App name (Lora serif, center), location pin + city name (tappable, opens Location screen), notification bell icon, Hijri + Gregorian date below
- **Date Navigator**: Left/right chevron buttons with "Today" label for the current date; shows full date when browsing other days
- **Hero Card**: White rounded card (20px) showing the next prayer name (42px Lora bold), time (28px DM Sans), and a countdown pill badge in accent amber. Decorative soft circles in background.
- **Prayer List**: 6 rows — Fajr, Shurkuk, Dhuhr, Asr, Maghrib, Isha. Each row has: icon circle (primary-light bg), prayer name, optional "CURRENT" label, notification bell tap target, and time. Current prayer row uses accent-light background + 3px left accent border. Past prayers are 55% opacity.

### 2. Qibla Screen
- Large serif "Qibla" title, city name + direction in degrees (e.g. "142° SE")
- **Compass**: 260×260px circle with cardinal labels (N/E/S/W), degree tick marks on a rotating ring, a triangular needle pointing toward Mecca with a Ka'bah icon at tip, animated rotation simulating device heading
- Islamic geometric hex pattern as a low-opacity background watermark
- **Calibration card**: bottom card with compass icon, status text, and green/orange dot indicator

### 3. Settings Screen
- Lora serif page title + subtitle
- **Location section**: Shows current city with "Change" button
- **Calculation section**: Dropdown selector (MWL / ISNA / Egypt / Makkah) + Madhab toggle (Shafi / Hanafi) affecting Asr time
- **Prayer Alerts section**: 5 prayer rows (Fajr, Dhuhr, Asr, Maghrib, Isha), each with icon, prayer name, notification type subtitle, and toggle switch
- **System section**: Global notifications toggle + Clear Cache button with confirmation state ("Cleared!" flash)
- All sections use white rounded cards (16px) with hairline dividers (bg color) between rows

### 4. Location Screen
- Back arrow + "Location" title
- **Search bar**: white card with magnifier icon, placeholder "Search Swedish cities...", clear button
- **Detect My Location**: ghost button with primary border, shows spinner during detection
- **Recently Used**: list of 3 most recent cities; current city has primary bg icon + left border accent + "Current Location" subtitle
- **Popular cities**: pill chips in white cards, primary bg when selected
- All 20 Swedish cities available: Stockholm, Gothenburg, Malmö, Uppsala, Västerås, Örebro, Linköping, Helsingborg, Jönköping, Norrköping, Lund, Umeå, Gävle, Borås, Sundsvall, Eskilstuna, Södertälje, Karlstad, Växjö, Halmstad

### 5. About Screen
- Centered app icon (72×72px, primary bg, 20px radius, shadow)
- App name (Lora 24px bold), version string, tagline
- **Mission, Privacy First, Community** — white cards (16px radius) each with emoji icon + title + body text
- **Links list**: Rate on App Store, Report an Issue, Terms & Privacy Policy — borderless rows with icon + chevron
- Footer: "© 2026 SWEDEN PRAYER · PEACE & BLESSINGS"

## Navigation

**Bottom Tab Bar** — 4 tabs: Prayer, Qibla, Settings, About
- Active tab: primary color icon + bold label + 3px top indicator line
- Inactive tab: textSub color, regular weight
- Background: white with high-opacity backdrop (0.95), 1px top border
- Tab bar hidden when Location screen is open (Location is a modal-style screen pushed from Prayer or Settings)

## Color Themes

**Active theme: Sage.** The app is hardcoded to the Sage theme in `Sweden Prayer.html` (`ACTIVE_THEME = 'sage'`). All three theme token sets are preserved in `constants/theme.jsx` for a future Settings > Appearance feature — do not remove them.

| Theme | Status | Primary | Accent | Background |
|-------|--------|---------|--------|------------|
| **Sage** | ✅ Active | `#2d5a42` forest green | `#c8892a` warm amber | `#f5ede4` cream |
| **Rose** | 🔒 Reserved | `#8b1a3a` deep burgundy | `#c0395a` rose | `#fdf0f3` blush |
| **Slate** | 🔒 Reserved | `#2c3e6b` navy | `#d4862a` gold | `#f0f2f5` cool white |

## Prayer Time Calculation

Prayer times are computed client-side using astronomical solar position formulas:
- Julian Date → solar declination + equation of time → solar transit
- Fajr: sun at −18° / Isha: sun at −17° (Muslim World League defaults)
- Shurkuk (sunrise) / Maghrib: sun at −0.833°
- Asr: shadow length = 1 + tan(|latitude − declination|)
- Configurable methods: MWL, ISNA, Egypt, Makkah

Hijri date conversion uses the Kuwaiti algorithm for display alongside the Gregorian date.

## Notification Model

Per-prayer toggles stored in component state (to be persisted to device storage). Notification types per prayer:
- `adhan+15m` — Adhan & 15-minute pre-alert
- `adhan+10m` — Adhan & 10-minute pre-alert  
- `adhan` — Adhan only
- `silent` — Silent (no alert)

Global notifications master toggle overrides all individual settings.

## Elevation & Depth

- **Background**: Theme `bg` color (warm off-white)
- **Cards (Level 1)**: `#ffffff` with `box-shadow: 0 1px 4-6px rgba(0,0,0,0.05-0.08)`
- **Hero Card**: `box-shadow: 0 2px 16px rgba(0,0,0,0.06)` + decorative circle accents
- **Current Prayer Row**: `box-shadow: 0 2px 12px accent×0.2` + accent-light fill
- **App icon (About)**: `box-shadow: 0 8px 24px primary×0.4`

## Islamic Geometric Pattern

Used as low-opacity background watermark on the Qibla screen. SVG hexagon + inner hexagon + spokes pattern, stroke only, primary color at ~12% opacity. Tiled via `background-image: url("data:image/svg+xml,...")`.


