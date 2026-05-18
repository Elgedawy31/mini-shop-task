import { Image, StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated from "react-native-reanimated";

import type { Order } from "@/lib/api/models";
import { theme } from "@/theme/theme";
import { formatCompactDateTime, formatCurrency } from "@/lib/format";
import { AppText, HStack } from "@/ui/Primitives";
import { OrderStatusBadge } from "@/ui/OrderStatusBadge";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";
import { useFadeInUp } from "@/ui/shop/useFadeInUp";

const PREVIEW_LIMIT = 3;

export function OrderListCard({
  order,
  onPress,
  index = 0,
}: {
  order: Order;
  onPress: () => void;
  index?: number;
}) {
  const items = order.items ?? [];
  const preview = items.slice(0, PREVIEW_LIMIT);
  const extraCount = Math.max(0, items.length - PREVIEW_LIMIT);
  const itemCount = items.length;
  const fadeStyle = useFadeInUp(Math.min(index, 6) * 45, index < 8);

  return (
    <Animated.View style={fadeStyle}>
      <AnimatedPressable onPress={onPress} style={styles.card}>
        <HStack justify="space-between" align="flex-start">
          <View style={styles.idBlock}>
            <AppText size={11} color={theme.colors.muted} weight="medium">
              ORDER
            </AppText>
            <AppText size={16} weight="bold">
              #{order.id.slice(0, 8).toUpperCase()}
            </AppText>
          </View>
          <OrderStatusBadge status={order.status} />
        </HStack>

        <AppText size={12} color={theme.colors.muted}>
          {formatCompactDateTime(order.createdAt)}
        </AppText>

        {preview.length > 0 ? (
          <View style={styles.previewRow}>
            {preview.map((item) => (
              <View key={item.id} style={styles.thumb}>
                {item.productImageUrl ? (
                  <Image
                    source={{ uri: item.productImageUrl }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbPlaceholder} />
                )}
              </View>
            ))}
            {extraCount > 0 ? (
              <View style={styles.moreThumb}>
                <AppText size={11} weight="semibold" color={theme.colors.muted}>
                  +{extraCount}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.divider} />

        <HStack justify="space-between" align="center">
          <View style={{ gap: 2 }}>
            <AppText size={12} color={theme.colors.muted}>
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </AppText>
            <AppText size={16} weight="bold" color="#FFF7ED">
              {formatCurrency(order.totalAmount)}
            </AppText>
          </View>
          <View style={styles.chevron}>
            <FontAwesome name="chevron-right" size={11} color={theme.colors.primary2} />
          </View>
        </HStack>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.space[4],
    gap: theme.space[3],
  },
  idBlock: {
    gap: 2,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
  moreThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,122,24,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.25)",
  },
});
