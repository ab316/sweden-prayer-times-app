// Mirrors the brand tokens in constants/brand.ts and tailwind.config.js.
// All three must agree. Tailwind drives JSX className styling; this map is
// for runtime reads (SVG fills, React Navigation tints, animated colors).

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
  // Maghrib Horizon · Mihrab Window — active palette
  sage: {
    bg:           '#fde6cf',                  // brand.cream
    card:         '#fef2e1',                  // colors.light.surface
    primary:      '#9c3b50',                  // brand.rose
    primaryLight: 'rgba(156,59,80,0.08)',      // rose tint — icon bgs, tracks
    accent:       '#d96a4a',                  // brand.ember
    accentLight:  'rgba(217,106,74,0.12)',     // ember tint — active row, hero
    text:         '#3a1638',                  // brand.plumDeep
    textSub:      '#7a6a7a',                  // brand.inkMute
    tabBg:        'rgba(253,230,207,0.95)',    // cream-based tab bar
    currentRow:   'rgba(217,106,74,0.08)',     // ember row highlight
    currentBorder:'#d96a4a',                  // brand.ember
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
