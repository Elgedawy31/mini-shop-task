import { Image, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { useOrder } from "@/features/hooks";
import type { OrderStatus } from "@/lib/api/models";
import { formatCompactDateTime, formatCurrency } from "@/lib/format";
import { theme } from "@/theme/theme";
import { AppText, Card, HStack, Screen, VStack } from "@/ui/Primitives";
import { Skeleton } from "@/ui/Skeleton";
import { OrderStatusBadge } from "@/ui/OrderStatusBadge";

const FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

function stepLabel(status: OrderStatus) {
  if (status === "pending") return "Order placed";
  if (status === "processing") return "Processing";
  if (status === "shipped") return "Shipped";
  if (status === "delivered") return "Delivered";
  return "Cancelled";
}

export default function OrderDetail() {
  const params = useLocalSearchParams<{ id: string; new?: string }>();
  const id = String(params.id ?? "");
  const isNew = params.new === "1";

  const { data: order, isLoading, isFetching, refetch } = useOrder(id);

  const statusIndex = order ? FLOW.indexOf(order.status) : -1;

  return (
    <Screen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.space[4], paddingBottom: theme.space[8], gap: 14 }}
        refreshControl={undefined}
      >
        {isLoading ? (
          <>
            <Skeleton height={120} style={{ borderRadius: theme.radii.xl }} />
            <Skeleton height={220} style={{ borderRadius: theme.radii.xl }} />
            <Skeleton height={260} style={{ borderRadius: theme.radii.xl }} />
          </>
        ) : order ? (
          <>
            {isNew ? (
              <Card style={{ padding: theme.space[4], backgroundColor: "rgba(187,77,0,0.14)" }}>
                <VStack gap={6}>
                  <AppText weight="bold">Order confirmed</AppText>
                  <AppText size={12} color={theme.colors.muted}>
                    We’re on it. You can track status updates here.
                  </AppText>
                </VStack>
              </Card>
            ) : null}

            <Card style={{ padding: theme.space[4] }}>
              <VStack gap={12}>
                <HStack justify="space-between">
                  <VStack gap={4}>
                    <AppText weight="bold">#{order.id.slice(0, 8)}</AppText>
                    <AppText size={12} color={theme.colors.muted}>
                      Placed {formatCompactDateTime(order.createdAt)}
                    </AppText>
                  </VStack>
                  <OrderStatusBadge status={order.status} />
                </HStack>

                <View style={{ height: 1, backgroundColor: theme.colors.border }} />

                {order.status === "cancelled" ? (
                  <AppText size={13} color={theme.colors.muted}>
                    This order was cancelled.
                  </AppText>
                ) : (
                  <VStack gap={10}>
                    <AppText size={13} weight="semibold">
                      Status
                    </AppText>
                    {FLOW.map((step, idx) => {
                      const active = idx <= statusIndex;
                      return (
                        <HStack key={step} gap={12} align="flex-start">
                          <View style={{ alignItems: "center" }}>
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                backgroundColor: active
                                  ? theme.colors.primary2
                                  : "rgba(255,255,255,0.12)",
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                marginTop: 3,
                              }}
                            />
                            {idx < FLOW.length - 1 ? (
                              <View
                                style={{
                                  width: 2,
                                  height: 20,
                                  backgroundColor: active
                                    ? "rgba(255,122,24,0.35)"
                                    : "rgba(255,255,255,0.08)",
                                  marginTop: 6,
                                }}
                              />
                            ) : null}
                          </View>
                          <VStack gap={2} style={{ flex: 1 }}>
                            <AppText weight="semibold">{stepLabel(step)}</AppText>
                            {idx === statusIndex ? (
                              <AppText size={12} color={theme.colors.muted}>
                                Current step
                              </AppText>
                            ) : null}
                          </VStack>
                        </HStack>
                      );
                    })}
                  </VStack>
                )}
              </VStack>
            </Card>

            <Card style={{ padding: theme.space[4] }}>
              <VStack gap={12}>
                <AppText size={14} weight="bold">
                  Items
                </AppText>
                <VStack gap={10}>
                  {(order.items ?? []).map((item) => (
                    <HStack key={item.id} gap={12} align="flex-start">
                      <View
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 16,
                          overflow: "hidden",
                          backgroundColor: theme.colors.surface2,
                        }}
                      >
                        {item.productImageUrl ? (
                          <Image
                            source={{ uri: item.productImageUrl }}
                            style={{ width: "100%", height: "100%" }}
                          />
                        ) : (
                          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
                        )}
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <AppText weight="semibold" numberOfLines={2}>
                          {item.productName}
                        </AppText>
                        <AppText size={12} color={theme.colors.muted}>
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </AppText>
                      </View>
                      <AppText weight="bold">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </AppText>
                    </HStack>
                  ))}
                </VStack>

                <View style={{ height: 1, backgroundColor: theme.colors.border }} />

                <HStack justify="space-between">
                  <AppText size={12} color={theme.colors.muted}>
                    Total
                  </AppText>
                  <AppText weight="bold">{formatCurrency(order.totalAmount)}</AppText>
                </HStack>
              </VStack>
            </Card>

            <Pressable
              onPress={() => void refetch()}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <AppText
                size={12}
                weight="medium"
                color={theme.colors.primary2}
                style={{ textAlign: "center" }}
              >
                {isFetching ? "Refreshing…" : "Refresh"}
              </AppText>
            </Pressable>
          </>
        ) : (
          <Card style={{ padding: theme.space[4] }}>
            <VStack gap={10}>
              <AppText weight="bold">Order not found</AppText>
              <AppText size={12} color={theme.colors.muted}>
                Pull to refresh or try again.
              </AppText>
            </VStack>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
