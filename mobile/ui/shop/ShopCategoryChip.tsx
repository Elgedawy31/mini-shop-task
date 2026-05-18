import { useEffect } from "react";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/ThemeContext";
import { AppText } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";

export function ShopCategoryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors, isDark } = useAppTheme();
  const progress = useSharedValue(active ? 1 : 0);

  const activeBg = isDark ? "rgba(187,77,0,0.22)" : "rgba(234,88,12,0.14)";
  const activeBorder = isDark ? "rgba(255,122,24,0.45)" : "rgba(234,88,12,0.40)";

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, progress]);

  const chipStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface2, activeBg]),
      borderColor: interpolateColor(progress.value, [0, 1], [colors.border, activeBorder]),
    }),
    [colors.surface2, colors.border, activeBg, activeBorder]
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        {
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 999,
          borderWidth: 1,
        },
        chipStyle,
      ]}
    >
      <AppText
        size={12}
        weight="medium"
        color={active ? (isDark ? "#FFF7ED" : colors.primary) : colors.muted}
      >
        {label}
      </AppText>
    </AnimatedPressable>
  );
}
