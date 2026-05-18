import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { theme } from "@/theme/theme";
import { AppText } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";

export function OrdersEmptyState({ filtered }: { filtered?: boolean }) {
  return (
    <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.wrap}>
      <View style={styles.glow} />
      <View style={styles.iconRing}>
        <FontAwesome
          name={filtered ? "filter" : "shopping-bag"}
          size={28}
          color={theme.colors.primary2}
        />
      </View>

      <View style={styles.copy}>
        <AppText size={18} weight="bold" style={{ textAlign: "center" }}>
          {filtered ? "No orders in this filter" : "No orders yet"}
        </AppText>
        <AppText
          size={13}
          color={theme.colors.muted}
          style={{ textAlign: "center", lineHeight: 20 }}
        >
          {filtered
            ? "Try another status or clear the filter to see your full order history."
            : "When you place your first order, it will show up here with live status updates."}
        </AppText>
      </View>

      <AnimatedPressable onPress={() => router.replace("/(tabs)/shop")} style={styles.cta}>
        <FontAwesome name="shopping-bag" size={14} color="#FFF7ED" />
        <AppText size={14} weight="semibold" color="#FFF7ED">
          Browse shop
        </AppText>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: theme.space[5],
    paddingVertical: theme.space[8],
    gap: theme.space[5],
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 999,
    top: -80,
    backgroundColor: "rgba(255,122,24,0.12)",
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,122,24,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.28)",
  },
  copy: {
    gap: theme.space[2],
    maxWidth: 280,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: theme.space[5],
    paddingVertical: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.35)",
  },
});
