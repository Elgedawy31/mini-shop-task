import { darkColors, type ThemeColors } from "@/theme/palettes";

export const themeTokens = {
  radii: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
  },
  font: {
    regular: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semibold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
  },
} as const;

let activeColors: ThemeColors = { ...darkColors };

export function setActiveThemeColors(colors: ThemeColors) {
  activeColors = colors;
}

export const theme = {
  ...themeTokens,
  get colors() {
    return activeColors;
  },
};

export type AppTheme = typeof theme;
