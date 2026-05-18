import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { router } from "expo-router";

import { useMyOrders } from "@/features/hooks";
import { theme } from "@/theme/theme";
import { formatCompactDateTime, formatCurrency } from "@/lib/format";
import { AppText, Card, HStack, Screen, VStack } from "@/ui/Primitives";
import { Skeleton } from "@/ui/Skeleton";
import { EmptyState } from "@/ui/EmptyState";
import { OrderStatusBadge } from "@/ui/OrderStatusBadge";

const STATUS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function Orders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      status: status === "all" ? undefined : status,
    }),
    [page, status]
  );

  const { data, isLoading, isFetching, refetch } = useMyOrders(params);
  const totalPages = data
    ? Math.max(1, Math.ceil(data.pagination.total / data.pagination.limit))
    : 1;

  return (
    <Screen padded={false}>
      <View
        style={{
          paddingHorizontal: theme.space[4],
          paddingTop: theme.space[4],
          paddingBottom: theme.space[3],
          gap: 12,
        }}
      >
        <View style={{ gap: 4 }}>
          <AppText size={22} weight="bold">
            Orders
          </AppText>
          <AppText size={12} color={theme.colors.muted}>
            Track your order history and current status.
          </AppText>
        </View>

        <FlatList
          data={STATUS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
          keyExtractor={(i) => i.key}
          renderItem={({ item }) => {
            const active = item.key === status;
            return (
              <Pressable
                onPress={() => {
                  setStatus(item.key);
                  setPage(1);
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: active ? "rgba(187,77,0,0.22)" : theme.colors.surface2,
                  borderWidth: 1,
                  borderColor: active ? "rgba(255,122,24,0.45)" : theme.colors.border,
                  opacity: pressed ? 0.92 : 1,
                })}
              >
                <AppText size={12} weight="medium" color={active ? "#FFF7ED" : theme.colors.muted}>
                  {item.label}
                </AppText>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: theme.space[4], gap: 12 }}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} height={92} style={{ borderRadius: theme.radii.xl }} />
          ))}
        </View>
      ) : data && data.items.length === 0 ? (
        <View style={{ padding: theme.space[4] }}>
          <EmptyState
            title="No orders yet"
            description="Place your first order from the Shop tab."
          />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: theme.space[4],
            paddingBottom: theme.space[8],
            gap: 12,
          }}
          refreshing={isFetching}
          onRefresh={() => void refetch()}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (isFetching) return;
            if (page < totalPages) setPage((p) => p + 1);
          }}
          onEndReachedThreshold={0.35}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/order/${item.id}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
            >
              <Card style={{ padding: theme.space[4] }}>
                <VStack gap={10}>
                  <HStack justify="space-between">
                    <AppText weight="bold">#{item.id.slice(0, 8)}</AppText>
                    <OrderStatusBadge status={item.status} />
                  </HStack>
                  <HStack justify="space-between">
                    <AppText size={12} color={theme.colors.muted}>
                      {formatCompactDateTime(item.createdAt)}
                    </AppText>
                    <AppText weight="semibold">{formatCurrency(item.totalAmount)}</AppText>
                  </HStack>
                  <AppText size={12} color={theme.colors.muted}>
                    {item.items?.length ?? 0} item{(item.items?.length ?? 0) === 1 ? "" : "s"}
                  </AppText>
                </VStack>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
