export const theme = {
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
  colors: {
    // Dark by default, aligned with dashboard direction.
    bg: "#0B0B0D",
    surface: "#141419",
    surface2: "#1A1B22",
    text: "#F4F4F5",
    muted: "#A1A1AA",
    border: "rgba(255,255,255,0.10)",
    primary: "#BB4D00",
    primary2: "#FF7A18",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#60A5FA",
  },
} as const;

export type AppTheme = typeof theme;
