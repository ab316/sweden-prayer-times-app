/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Populate from design/Design.md when the design system is exported
      // from Stitch. Existing app tokens live in constants/theme.ts and can
      // be mirrored here so Stitch's class names resolve to project tokens.
      colors: {},
      fontFamily: {},
      spacing: {},
    },
  },
  plugins: [],
};
