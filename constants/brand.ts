/**
 * Sakinah Bloom — Brand color tokens
 * Maghrib Horizon · Mihrab Window
 *
 * Drop this file into your RN project (e.g. constants/brand.ts) and
 * import the tokens wherever you need them. Hex values, not RGB tuples,
 * because RN supports hex strings natively in style props.
 */

export const brand = {
  // ── Anchors ── (top → bottom of the maghrib sky)
  plumDeep:  '#3a1638',   // shadow · base · top of dark gradient
  plum:      '#581e44',   // mid · gradient transition
  rose:      '#9c3b50',   // PRIMARY · brand color, dominant surface
  ember:     '#d96a4a',   // accent · warm midtone
  peach:     '#f4c987',   // highlight · sky-near-horizon
  cream:     '#fde6cf',   // surface · ink on dark, light backgrounds

  // ── Splash gradient stops (top → bottom) ──
  splashStopsLight: ['#3a1638', '#9c3b50', '#d96a4a', '#f4c987', '#fde6cf'],
  splashStopsDark:  ['#1f0e20', '#3a1638', '#581e44', '#9c3b50', '#d96a4a'],

  // ── Supporting ink ──
  ink:       '#1a0e1a',
  inkSoft:   '#3a2a3a',
  inkMute:   '#7a6a7a',
} as const;

/**
 * Semantic tokens — bind UI roles to brand values.
 * Edit the right-hand side if you re-skin; component code references roles, not raw colors.
 */
export const colors = {
  // Light theme — cream bg, rose primary, ember accents
  light: {
    background:     brand.cream,
    surface:        '#fef2e1',
    surfaceAlt:     '#f4e5cc',
    primary:        brand.rose,
    primaryOn:      brand.cream,
    accent:         brand.ember,
    accentOn:       brand.cream,
    text:           brand.plumDeep,
    textMuted:      brand.inkMute,
    border:         'rgba(58, 22, 56, 0.12)',
    divider:        'rgba(58, 22, 56, 0.08)',
  },
  // Dark theme — plum bg, peach text
  dark: {
    background:     brand.plumDeep,
    surface:        '#2a1028',
    surfaceAlt:     '#3a1638',
    primary:        brand.peach,
    primaryOn:      brand.plumDeep,
    accent:         brand.ember,
    accentOn:       brand.cream,
    text:           brand.peach,
    textMuted:      'rgba(244, 201, 135, 0.6)',
    border:         'rgba(244, 201, 135, 0.18)',
    divider:        'rgba(244, 201, 135, 0.12)',
  },
} as const;

export const typography = {
  serif:     'Lora',                       // wordmark, prayer names, h1
  sans:      'DM Sans',                    // body, UI, tags
  monospace: 'ui-monospace, Menlo, monospace',
} as const;

export const icon = {
  bg:           brand.rose,                  // dominant surface
  bgGradient:   brand.splashStopsLight,      // multi-stop gradient
  fg:           brand.peach,                 // arch wall panel
  fgShadow:     brand.plumDeep,              // inset niche
  lamp:         brand.cream,                 // lamp body
  cornerRadius: 0.225,                       // iOS squircle ratio
  safeZone:     0.66,                        // Android adaptive
} as const;

export type BrandColor = keyof typeof brand;
export type ThemeColors = typeof colors.light;
