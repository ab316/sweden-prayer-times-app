---
name: Modern Islamic Prayer Design System
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f1'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#404944'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#2f2e28'
  on-tertiary: '#ffffff'
  tertiary-container: '#46443e'
  on-tertiary-container: '#b5b1a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e7e2d9'
  tertiary-fixed-dim: '#cac6be'
  on-tertiary-fixed: '#1d1c16'
  on-tertiary-fixed-variant: '#494740'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e0'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  section-gap: 40px
  element-gap: 12px
---

## Brand & Style

The core philosophy of this design system is "Spiritual Precision." It seeks to bridge the gap between the functional clarity of Scandinavian modernism and the mathematical beauty of Islamic art. The goal is to create a digital sanctuary—an interface that feels less like a utility and more like a breath of fresh air.

The design style is **Minimalism** with subtle **Glassmorphism** and **Tonal Layering**. We leverage heavy whitespace to reduce cognitive load, allowing the user to focus on their spiritual schedule. Visual interest is generated through light, texture, and geometry rather than decorative clutter. The emotional response should be one of profound calm, reliability, and premium craftsmanship.

## Colors

The palette is anchored by **Deep Emerald**, representing life and growth, used primarily for high-emphasis actions and active states. **Soft Gold** is reserved for highlights, icons, and meaningful ornaments, such as indicating the current prayer or the Qibla direction. 

The background utilizes an **Off-white** (Bone/Alabaster) to soften the glare often found in pure white interfaces, adhering to the Swedish preference for warm, natural light. Secondary surfaces use a very pale "Sand" tint to create hierarchy without the need for harsh borders. Text uses a soft charcoal rather than pure black to maintain a high-end, editorial feel.

## Typography

This design system employs a sophisticated dual-font strategy. **Noto Serif** is used for headlines, prayer names, and spiritual quotes to evoke a sense of tradition, authority, and timelessness. It provides the "soul" of the interface.

**Manrope** serves as the functional workhorse for prayer times, countdowns, and settings. Its modern, geometric construction ensures maximum legibility at a glance, adhering to the Swedish principle of "form follows function." All labels and utility text use Manrope with increased letter spacing to ensure clarity in high-density information areas.

## Layout & Spacing

The layout follows a **Fixed Grid** model on mobile and a centered **Fluid Grid** on larger viewports. We utilize an 8px base unit to ensure rhythmic consistency. 

Generous margins (24px minimum) are essential to the "Swedish Minimalism" aspect of the design, ensuring that elements never feel cramped. Vertical rhythm is prioritized, with significant gaps (40px+) between major sections (e.g., the Daily Prayer list and the Sun/Moon phase section) to allow the UI to "breathe."

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. Instead of floating elements high above the background, we use subtle depth to suggest they are resting on a soft surface.

- **Level 0 (Background):** The off-white base.
- **Level 1 (Cards/Surface):** White cards with a 2px blur, 4% opacity neutral shadow. This creates a "soft lift."
- **Level 2 (Active/Current Prayer):** A subtle glassmorphic effect—using a backdrop blur (12px) and a very thin 1px inner stroke in Soft Gold—to highlight the current time of day.
- **Overlays:** Full-screen modals use a high-blur backdrop filter (20px) to maintain the sense of place while focusing the user's attention.

## Shapes

The shape language is defined by **Softened Geometry**. We avoid aggressive 90-degree angles in favor of 16px (rounded-lg) and 24px (rounded-xl) corners for cards and containers. This creates a "peaceful" and approachable aesthetic.

Subtle **Islamic Geometric Patterns** (such as the 8-point star or Girih patterns) should be used exclusively as background watermarks or mask overlays on containers. They must be low contrast—no more than 3-5% opacity—to ensure they never distract from the content.

## Components

### Prayer Cards
The primary component. Each card uses a Level 1 elevation. The "Current Prayer" card transitions to Level 2 with a Soft Gold left-edge accent (4px width). Prayer names are Noto Serif; times are Manrope Semi-bold.

### Action Buttons
Primary buttons are solid Deep Emerald with white text, featuring 24px rounded corners (pill-shaped). Secondary buttons use an Ghost/Outline style with a 1px Soft Gold border and Deep Emerald text.

### Progress Indicators
The "Time Remaining" for the next prayer is shown via a thin, circular stroke or a linear bar using the Soft Gold color against a Tertiary Sand background. The motion should be slow and fluid.

### Chips & Tags
Used for "Sunnah," "Makruh," or "Jumu'ah" alerts. These are small, Manrope-based labels with a Tertiary background and no border, using subtle emerald or gold text.

### Lists
Settings and mosque lists use clean, borderless rows separated only by whitespace or a 0.5px hair-line divider in a very light neutral shade.

### Navigation
A bottom navigation bar with high-blur glassmorphism. Icons are custom-drawn with a 1.5pt stroke weight, using Gold for the active state and Emerald for the inactive state.