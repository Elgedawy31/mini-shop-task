import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { theme } from "@/theme/theme";
import { AppText } from "@/ui/Primitives";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AddToCartButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onAdd: () => void;
};

export function AddToCartButton({ disabled, loading, onAdd }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const scale = useSharedValue(1);
  const success = useSharedValue(0);

  const handlePress = useCallback(() => {
    if (disabled || loading || added) return;

    onAdd();
    setAdded(true);
    scale.value = withSequence(
      withSpring(0.94, { damping: 14, stiffness: 320 }),
      withSpring(1.04, { damping: 12, stiffness: 280 }),
      withSpring(1, { damping: 16, stiffness: 260 })
    );
    success.value = withTiming(1, { duration: 280 });

    setTimeout(() => {
      success.value = withTiming(0, { duration: 320 });
      setAdded(false);
    }, 1400);
  }, [added, disabled, loading, onAdd, scale, success]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      success.value,
      [0, 1],
      [theme.colors.primary, theme.colors.success]
    ),
    borderColor: interpolateColor(
      success.value,
      [0, 1],
      [theme.colors.border, "rgba(34,197,94,0.45)"]
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: success.value,
    transform: [{ scale: 0.5 + success.value * 0.5 }],
  }));

  const isDisabled = Boolean(disabled || loading);

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={isDisabled}
      style={[styles.button, buttonStyle, isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color="#FFF7ED" />
      ) : (
        <View style={styles.row}>
          <Animated.View style={checkStyle}>
            <FontAwesome name="check" size={14} color="#FFF7ED" />
          </Animated.View>
          <AppText size={14} weight="semibold" color="#FFF7ED">
            {added ? "Added to cart!" : "Add to cart"}
          </AppText>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.space[4],
  },
  disabled: {
    opacity: 0.55,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
