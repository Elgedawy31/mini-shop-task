import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  View,
} from "react-native";
import { router } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useInfiniteMyOrders } from "@/features/hooks";
import { useAppTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme/theme";
import type { Order } from "@/lib/api/models";
import { AppText, Screen } from "@/ui/Primitives";
import { Skeleton } from "@/ui/Skeleton";
import { OrderListCard } from "@/ui/orders/OrderListCard";
import { OrdersEmptyState } from "@/ui/orders/OrdersEmptyState";
import { ShopCategoryChip } from "@/ui/shop/ShopCategoryChip";

const PAGE_SIZE = 10;

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function OrderCardSkeleton() {
  return <Skeleton height={168} style={{ borderRadius: theme.radii.xl }} />;
}

function OrdersHeader({
  status,
  onStatusChange,
  orderCount,
}: {
  status: string;
  onStatusChange: (key: string) => void;
  orderCount: number;
}) {
  const { colors } = useAppTheme();
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(10);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 350 });
    headerY.value = withTiming(0, { duration: 350 });
  }, [headerOpacity, headerY]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: theme.space[4],
          paddingTop: theme.space[4],
          paddingBottom: theme.space[3],
          gap: 12,
        },
        headerStyle,
      ]}
    >
      <View style={{ gap: 4 }}>
        <HStackTitle count={orderCount} />
        <AppText size={12} color={colors.muted}>
          Track your order history and current status.
        </AppText>
      </View>

      <FlatList
        data={STATUS_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <ShopCategoryChip
            label={item.label}
            active={status === item.key}
            onPress={() => onStatusChange(item.key)}
          />
        )}
      />
    </Animated.View>
  );
}

function HStackTitle({ count }: { count: number }) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <AppText size={22} weight="bold">
        Orders
      </AppText>
      {count > 0 ? (
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: isDark ? "rgba(255,122,24,0.14)" : "rgba(234,88,12,0.12)",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,122,24,0.28)" : "rgba(234,88,12,0.24)",
          }}
        >
          <AppText size={11} weight="semibold" color={colors.primary2}>
            {count}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

export default function Orders() {
  const { colors } = useAppTheme();
  const [status, setStatus] = useState("all");
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const listParams = useMemo(
    () => ({
      limit: PAGE_SIZE,
      status: status === "all" ? undefined : status,
    }),
    [status]
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteMyOrders(listParams);

  const orders = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  const totalCount = data?.pages[0]?.pagination.total ?? orders.length;
  const isInitialLoading = isLoading && orders.length === 0;
  const isFiltered = status !== "all";

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

      if (distanceFromBottom < 240 && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const renderOrder = useCallback(
    ({ item, index }: { item: Order; index: number }) => (
      <OrderListCard order={item} index={index} onPress={() => router.push(`/order/${item.id}`)} />
    ),
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsPullRefreshing(false);
    }
  }, [refetch]);

  const listHeader = (
    <OrdersHeader status={status} onStatusChange={setStatus} orderCount={totalCount} />
  );

  return (
    <Screen padded={false}>
      <FlatList<Order>
        data={orders}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{
          paddingHorizontal: theme.space[4],
          paddingBottom: theme.space[8],
          gap: 12,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={colors.primary2}
          />
        }
        renderItem={renderOrder}
        ListEmptyComponent={
          isInitialLoading ? (
            <View style={{ gap: 12 }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <OrderCardSkeleton key={idx} />
              ))}
            </View>
          ) : (
            <OrdersEmptyState filtered={isFiltered} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ gap: 12, paddingTop: 4 }}>
              <OrderCardSkeleton />
            </View>
          ) : (
            <View style={{ height: 16 }} />
          )
        }
      />
    </Screen>
  );
}
