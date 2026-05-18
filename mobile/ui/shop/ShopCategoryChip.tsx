import { useEffect } from "react";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { theme } from "@/theme/theme";
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
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, progress]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.surface2, "rgba(187,77,0,0.22)"]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.border, "rgba(255,122,24,0.45)"]
    ),
  }));

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
      <AppText size={12} weight="medium" color={active ? "#FFF7ED" : theme.colors.muted}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
}
