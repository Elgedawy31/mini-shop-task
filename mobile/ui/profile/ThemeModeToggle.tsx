import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { useAppTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme/theme";
import { AppText } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";

export function ThemeModeToggle() {
  const { isDark, toggleMode, colors } = useAppTheme();

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(isDark ? 0 : 28, { duration: 220 }) }],
  }));

  return (
    <View style={[styles.row, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
      <View style={styles.copy}>
        <AppText size={14} weight="semibold">
          Appearance
        </AppText>
        <AppText size={12} color={colors.muted}>
          {isDark ? "Dark mode" : "Light mode"}
        </AppText>
      </View>

      <AnimatedPressable
        onPress={() => void toggleMode()}
        style={styles.track}
        accessibilityLabel="Toggle theme"
      >
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <FontAwesome name={isDark ? "moon-o" : "sun-o"} size={14} color={colors.text} />
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.space[4],
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  track: {
    width: 60,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,122,24,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.35)",
    padding: 3,
    justifyContent: "center",
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
});
