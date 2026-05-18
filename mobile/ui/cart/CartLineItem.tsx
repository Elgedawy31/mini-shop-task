import { Image, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated from "react-native-reanimated";

import type { CartItem } from "@/features/cart/CartContext";
import { theme } from "@/theme/theme";
import { formatCurrency } from "@/lib/format";
import { AppText, HStack } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";
import { useFadeInUp } from "@/ui/shop/useFadeInUp";

type CartLineItemProps = {
  item: CartItem;
  index?: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export function CartLineItem({
  item,
  index = 0,
  onDecrease,
  onIncrease,
  onRemove,
}: CartLineItemProps) {
  const lineTotal = item.price * item.quantity;
  const fadeStyle = useFadeInUp(Math.min(index, 6) * 40, index < 8);
  const canDecrease = item.quantity > 1;

  return (
    <Animated.View style={fadeStyle}>
      <View style={styles.card}>
        <Pressable
          onPress={() => router.push(`/product/${item.productId}`)}
          style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
        >
          <HStack align="flex-start" gap={12}>
            <View style={styles.thumb}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
            </View>

            <View style={styles.info}>
              <AppText size={14} weight="semibold" numberOfLines={2}>
                {item.name}
              </AppText>
              <AppText size={12} color={theme.colors.muted}>
                {formatCurrency(item.price)} each
              </AppText>
              <AppText size={15} weight="bold" color="#FFF7ED">
                {formatCurrency(lineTotal)}
              </AppText>
            </View>
          </HStack>
        </Pressable>

        <View style={styles.divider} />

        <HStack justify="space-between" align="center">
          <HStack gap={8}>
            <AnimatedPressable
              onPress={onDecrease}
              disabled={!canDecrease}
              style={[styles.qtyBtn, !canDecrease && styles.qtyBtnDisabled]}
            >
              <AppText weight="bold" size={16}>
                −
              </AppText>
            </AnimatedPressable>

            <View style={styles.qtyValue}>
              <AppText weight="bold" size={15}>
                {item.quantity}
              </AppText>
            </View>

            <AnimatedPressable onPress={onIncrease} style={styles.qtyBtn}>
              <AppText weight="bold" size={16}>
                +
              </AppText>
            </AnimatedPressable>
          </HStack>

          <Pressable
            onPress={onRemove}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <HStack gap={6} align="center">
              <FontAwesome name="trash-o" size={13} color={theme.colors.danger} />
              <AppText size={12} weight="medium" color={theme.colors.danger}>
                Remove
              </AppText>
            </HStack>
          </Pressable>
        </HStack>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.space[3],
    gap: theme.space[3],
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  info: {
    flex: 1,
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyValue: {
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
