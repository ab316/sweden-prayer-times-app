// Mirrors the token table in design/Design.md. Tailwind also has these
// values in tailwind.config.js — both must agree. tailwind drives JSX
// className styling; this map is for runtime reads (decorative SVG fills,
// React Navigation tints, animated colors, etc.).

export type ThemeName = 'sage' | 'rose' | 'slate';

export type ThemeTokens = {
  bg: string;
  card: string;
  primary: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  text: string;
  textSub: string;
  tabBg: string;
  currentRow: string;
  currentBorder: string;
};

export const THEMES: Record<ThemeName, ThemeTokens> = {
  sage: {
    bg: '#f5ede4',
    card: '#ffffff',
    primary: '#2d5a42',
    primaryLight: '#e8f0eb',
    accent: '#c8892a',
    accentLight: '#fdf3e3',
    text: '#1e2c24',
    textSub: '#6b7c72',
    tabBg: 'rgba(255,255,255,0.95)',
    currentRow: '#fdf3e3',
    currentBorder: '#c8892a',
  },
  // Reserved — wired up when the theme picker feature lands.
  rose: {
    bg: '#fdf0f3',
    card: '#ffffff',
    primary: '#8b1a3a',
    primaryLight: '#fde8ef',
    accent: '#c0395a',
    accentLight: '#fde8ef',
    text: '#2a0e1a',
    textSub: '#8a6070',
    tabBg: 'rgba(255,255,255,0.95)',
    currentRow: '#fde8ef',
    currentBorder: '#c0395a',
  },
  slate: {
    bg: '#f0f2f5',
    card: '#ffffff',
    primary: '#2c3e6b',
    primaryLight: '#e8ecf5',
    accent: '#d4862a',
    accentLight: '#fdf3e3',
    text: '#1a2035',
    textSub: '#6b7590',
    tabBg: 'rgba(255,255,255,0.95)',
    currentRow: '#fdf3e3',
    currentBorder: '#d4862a',
  },
};

export const ACTIVE_THEME: ThemeName = 'sage';

export const theme: ThemeTokens = THEMES[ACTIVE_THEME];
