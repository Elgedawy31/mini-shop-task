import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({
  children,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  style,
}: {
  children: ReactNode;
  onPress: PressableProps["onPress"];
  onPressIn?: PressableProps["onPressIn"];
  onPressOut?: PressableProps["onPressOut"];
  disabled?: boolean;
  style?: PressableProps["style"];
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      onPress={onPress}
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withSpring(0.98, { damping: 16, stiffness: 280 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 16, stiffness: 280 });
        onPressOut?.(e);
      }}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
