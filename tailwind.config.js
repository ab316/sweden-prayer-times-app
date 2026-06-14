/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Active theme: Maghrib Horizon · Mihrab Window ───────────────
        // Mirrors brand tokens in constants/brand.ts. tailwind drives JSX
        // className styling; constants/theme.ts holds the same values for
        // runtime reads (icon colors, animated values, etc.).
        bg:               "#fde6cf",           // brand.cream
        card:             "#fef2e1",           // colors.light.surface
        primary:          "#9c3b50",           // brand.rose
        "primary-light":  "rgba(156,59,80,0.08)",  // rose tint — icon bgs, tracks
        accent:           "#d96a4a",           // brand.ember
        "accent-light":   "rgba(217,106,74,0.12)", // ember tint — active row, hero
        text:             "#3a1638",           // brand.plumDeep
        "text-sub":       "#7a6a7a",           // brand.inkMute
        "tab-bg":         "rgba(253,230,207,0.95)", // cream-based tab bar
        "current-row":    "rgba(217,106,74,0.08)",  // ember row highlight
        "current-border": "#d96a4a",           // brand.ember

        // ── Reserved themes (preserved for a future theme picker) ───────
        "_rose-bg": "#fdf0f3",
        "_rose-primary": "#8b1a3a",
        "_rose-primary-light": "#fde8ef",
        "_rose-accent": "#c0395a",
        "_rose-text": "#2a0e1a",
        "_rose-text-sub": "#8a6070",
        "_slate-bg": "#f0f2f5",
        "_slate-primary": "#2c3e6b",
        "_slate-primary-light": "#e8ecf5",
        "_slate-accent": "#d4862a",
        "_slate-text": "#1a2035",
        "_slate-text-sub": "#6b7590",
      },
      fontFamily: {
        // Semantic aliases per Design.md typography table.
        "app-title": ["Lora_700Bold"],
        "display-lg": ["Lora_700Bold"],
        "headline-xl": ["Lora_700Bold"],
        "headline-md": ["Lora_700Bold"],
        "time-lg": ["DMSans_500Medium"],
        "time-md": ["DMSans_600SemiBold"],
        "body-md": ["DMSans_600SemiBold"],
        "body-sm": ["DMSans_400Regular"],
        label: ["DMSans_700Bold"],
        caption: ["DMSans_500Medium"],
        serif: ["Lora_400Regular"],
        sans: ["DMSans_400Regular"],
      },
      fontSize: {
        "app-title": ["20px", { lineHeight: "24px", letterSpacing: "-0.3px" }],
        "display-lg": ["42px", { lineHeight: "54px" }],
        "headline-xl": ["28px", { lineHeight: "34px" }],
        "headline-md": ["24px", { lineHeight: "32px" }],
        "time-lg": ["28px", { lineHeight: "34px", letterSpacing: "-0.5px" }],
        "time-md": ["16px", { lineHeight: "22px", letterSpacing: "-0.3px" }],
        "body-md": ["15px", { lineHeight: "22px" }],
        "body-sm": ["14px", { lineHeight: "20px" }],
        label: ["12px", { lineHeight: "16px", letterSpacing: "1.5px" }],
        caption: ["13px", { lineHeight: "18px" }],
      },
      spacing: {
        "screen-pad": "20px",
        "header-pad": "24px",
        "card-pad": "20px",
        "row-pad-y": "13px",
        "row-pad-x": "16px",
        "row-gap": "8px",
        "section-gap": "24px",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
        "tab-icon-bg": "10px",
        "prayer-row": "14px",
        "hero-card": "20px",
        "settings-card": "16px",
        "city-chips": "20px",
        toggle: "13px",
      },
    },
  },
  plugins: [],
};
