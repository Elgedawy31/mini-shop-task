/** Subtle fills for image placeholders and inactive UI chrome. */
export function mutedSurfaceFill(isDark: boolean, alpha = 0.06) {
  return isDark ? `rgba(255,255,255,${alpha})` : `rgba(24,24,27,${alpha})`;
}

export function statusStepDotInactive(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
}

export function statusStepLineInactive(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
}
