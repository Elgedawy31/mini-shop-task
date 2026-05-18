import type { ThemeColors } from "@/theme/palettes";

export function inputPlaceholderColor(colors: ThemeColors, isDark: boolean) {
  return isDark ? "rgba(244,244,245,0.35)" : "rgba(24,24,27,0.42)";
}

export function inputFocusBorderColor(isDark: boolean) {
  return isDark ? "rgba(255,122,24,0.55)" : "rgba(234,88,12,0.55)";
}
