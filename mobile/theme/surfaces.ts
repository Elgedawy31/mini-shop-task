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

export function productCardImageGradient(isDark: boolean): [string, string, string] {
  return isDark
    ? ["transparent", "rgba(11,11,13,0.75)", "rgba(11,11,13,0.95)"]
    : ["transparent", "rgba(24,24,27,0.22)", "rgba(24,24,27,0.42)"];
}

export function heroTopScrimGradient(isDark: boolean): [string, string, string] {
  return isDark
    ? ["rgba(11,11,13,0.72)", "rgba(11,11,13,0.2)", "transparent"]
    : ["rgba(248,248,250,0.92)", "rgba(248,248,250,0.4)", "transparent"];
}

export function heroBottomScrimGradient(isDark: boolean): [string, string] {
  return isDark
    ? ["transparent", "rgba(11,11,13,0.95)"]
    : ["transparent", "rgba(248,248,250,0.98)"];
}

export function overlayGlassButton(isDark: boolean) {
  return {
    backgroundColor: isDark ? "rgba(20,20,25,0.72)" : "rgba(255,255,255,0.88)",
    borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)",
  };
}

export function skeletonLineFill(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
}

export function splashGradientColors(isDark: boolean): [string, string, string] {
  return isDark ? ["#060607", "#0B0B0D", "#140B06"] : ["#F4F4F6", "#F8F8FA", "#FFF4EC"];
}

export function splashCardFills(isDark: boolean) {
  return {
    back: isDark ? "rgba(255,255,255,0.06)" : "rgba(24,24,27,0.05)",
    mid: isDark ? "rgba(255,122,24,0.12)" : "rgba(234,88,12,0.10)",
    front: isDark ? "rgba(187,77,0,0.18)" : "rgba(234,88,12,0.14)",
  };
}
