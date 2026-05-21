/** @type {import('tailwindcss').Config} */
const { colors, radii, spacing, fontFamily } = require("./src/theme/tokens");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { primary: colors.primary, secondary: colors.secondary, ink: colors.ink },
      borderRadius: { card: `${radii.card}px`, pill: `${radii.pill}px` },
      fontFamily: { body: [fontFamily.body], medium: [fontFamily.bodyMedium], heading: [fontFamily.heading] },
    },
  },
  plugins: [],
};
