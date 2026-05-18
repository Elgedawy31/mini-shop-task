export type ThemeColors = {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primary2: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
};

export const darkColors: ThemeColors = {
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
};

export const lightColors: ThemeColors = {
  bg: "#F8F8FA",
  surface: "#FFFFFF",
  surface2: "#F1F1F4",
  text: "#18181B",
  muted: "#71717A",
  border: "rgba(0,0,0,0.08)",
  primary: "#BB4D00",
  primary2: "#EA580C",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#2563EB",
};
