import { useEffect } from "react";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

export function useFadeInUp(delayMs = 0, enabled = true) {
  const opacity = useSharedValue(enabled ? 0 : 1);
  const translateY = useSharedValue(enabled ? 16 : 0);

  useEffect(() => {
    if (!enabled) return;
    opacity.value = withDelay(
      delayMs,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delayMs,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [delayMs, enabled, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}
