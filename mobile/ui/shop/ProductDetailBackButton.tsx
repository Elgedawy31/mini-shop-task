import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/theme/theme";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";

export function ProductDetailBackButton() {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.88);
  const translateX = useSharedValue(-8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    scale.value = withSpring(1, { damping: 20, stiffness: 260 });
    translateX.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [opacity, scale, translateX]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.host, { top: insets.top + 10 }, entranceStyle]}
    >
      <AnimatedPressable
        onPress={() => router.back()}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <FontAwesome name="chevron-left" size={16} color={theme.colors.text} />
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: theme.space[4],
    zIndex: 20,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,20,25,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
});
