import { useEffect, useRef } from "react";
import { Animated, type ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme/theme";

export function Skeleton({ height, style }: { height: number; style?: ViewStyle }) {
  const { colors, isDark } = useAppTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius: theme.radii.lg,
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          opacity,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    />
  );
}
