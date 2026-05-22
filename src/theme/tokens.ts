// Design tokens derived from Figma "Mindshine App UI Kit" variables.
export const colors = {
  primary: { DEFAULT: "#22D795", 100: "#4EDFAA", 200: "#00A462", 300: "#008A49" },
  secondary: { DEFAULT: "#D3F761", 400: "#6D9100", 500: "#547800" },
  ink: { DEFAULT: "#0D1101", 800: "#01130C" },
  white: "#FFFFFF",
  accentYellow: "#FFBB00",
  accentPink: "#F97B7B",
} as const;

export const radii = { sm: 8, md: 16, card: 24, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const fontFamily = {
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  heading: "MPLUSRounded1c_700Bold",
} as const;

export const fontSize = {
  xs: [12, 20],
  sm: [14, 22],
  base: [16, 24],
  lg: [18, 28],
  h6: [20, 22],
} as const;
