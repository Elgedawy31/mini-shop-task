import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export function AnimatedReveal({
  children,
  delay = 0,
  style,
  direction = "down",
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
  direction?: "down" | "up";
}) {
  const entering =
    direction === "up"
      ? FadeInUp.duration(420).delay(delay)
      : FadeInDown.duration(420).delay(delay);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
