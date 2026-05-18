import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { theme } from "@/theme/theme";
import { formatCurrency } from "@/lib/format";
import { AppText, HStack } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";

type CartSummaryBarProps = {
  itemCount: number;
  subtotal: number;
  loading?: boolean;
  onCheckout: () => void;
};

export function CartSummaryBar({ itemCount, subtotal, loading, onCheckout }: CartSummaryBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: theme.space[4] + insets.bottom,
        },
      ]}
    >
      <View style={styles.card}>
        <HStack justify="space-between">
          <View style={{ gap: 2 }}>
            <AppText size={12} color={theme.colors.muted}>
              Subtotal · {itemCount} item{itemCount === 1 ? "" : "s"}
            </AppText>
            <AppText size={20} weight="bold" color="#FFF7ED">
              {formatCurrency(subtotal)}
            </AppText>
          </View>
          <View style={styles.badge}>
            <FontAwesome name="lock" size={12} color={theme.colors.primary2} />
            <AppText size={11} weight="medium" color={theme.colors.primary2}>
              Secure
            </AppText>
          </View>
        </HStack>

        <AnimatedPressable
          onPress={onCheckout}
          disabled={loading}
          style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF7ED" />
          ) : (
            <HStack gap={10} align="center">
              <FontAwesome name="credit-card" size={14} color="#FFF7ED" />
              <AppText size={14} weight="semibold" color="#FFF7ED">
                Checkout
              </AppText>
            </HStack>
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.space[4],
    paddingTop: theme.space[3],
    backgroundColor: "rgba(11,11,13,0.94)",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  card: {
    gap: theme.space[4],
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,122,24,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.25)",
  },
  checkoutBtn: {
    height: 48,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutBtnDisabled: {
    opacity: 0.7,
  },
});
