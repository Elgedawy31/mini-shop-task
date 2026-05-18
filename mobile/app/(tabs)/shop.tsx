import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useCategories, useInfiniteProducts } from "@/features/hooks";
import { useAppTheme } from "@/theme/ThemeContext";
import { inputPlaceholderColor } from "@/theme/input";
import { theme } from "@/theme/theme";
import type { Product } from "@/lib/api/models";
import { AppText, HStack, Screen } from "@/ui/Primitives";
import { Skeleton } from "@/ui/Skeleton";
import { EmptyState } from "@/ui/EmptyState";
import { ProductCardSkeleton } from "@/ui/ProductCard";
import { MasonryProductGrid } from "@/ui/shop/MasonryProductGrid";
import { ShopCategoryChip } from "@/ui/shop/ShopCategoryChip";
import { useDebouncedValue } from "@/ui/hooks/useDebouncedValue";

const PAGE_SIZE = 12;
const SKELETON_ROWS = 4;
const SEARCH_DEBOUNCE_MS = 400;

function MasonrySkeleton({ rows = SKELETON_ROWS }: { rows?: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingHorizontal: theme.space[4],
      }}
    >
      <View style={{ flex: 1, gap: 12 }}>
        {Array.from({ length: rows }, (_, row) => (
          <ProductCardSkeleton key={`left-${row}`} size={row % 2 === 0 ? "large" : "compact"} />
        ))}
      </View>
      <View style={{ flex: 1, gap: 12 }}>
        {Array.from({ length: rows }, (_, row) => (
          <ProductCardSkeleton key={`right-${row}`} size={row % 2 === 0 ? "compact" : "large"} />
        ))}
      </View>
    </View>
  );
}

function ShopHeader({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categoryFilters,
  loadingCats,
  isSearching,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (slug: string) => void;
  categoryFilters: Array<{ slug: string; name: string }>;
  loadingCats: boolean;
  isSearching?: boolean;
}) {
  const { colors, isDark } = useAppTheme();
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(12);

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
        <AppText size={22} weight="bold">
          Shop
        </AppText>
        <AppText size={12} color={colors.muted}>
          Browse products in a curated grid.
        </AppText>
      </View>

      <View style={{ position: "relative" }}>
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search products"
          placeholderTextColor={inputPlaceholderColor(colors, isDark)}
          keyboardAppearance={isDark ? "dark" : "light"}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={{
            height: 48,
            borderRadius: theme.radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface2,
            paddingHorizontal: theme.space[4],
            paddingRight: isSearching ? 44 : theme.space[4],
            color: colors.text,
            fontFamily: theme.font.regular,
            fontSize: 14,
          }}
        />
        {isSearching ? (
          <ActivityIndicator
            size="small"
            color={colors.primary2}
            style={{ position: "absolute", right: 14, top: 14 }}
          />
        ) : null}
      </View>

      <FlatList
        data={categoryFilters}
        keyExtractor={(item) => item.slug}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
        renderItem={({ item }) => (
          <ShopCategoryChip
            label={item.name}
            active={category === item.slug}
            onPress={() => onCategoryChange(item.slug)}
          />
        )}
        ListEmptyComponent={
          loadingCats ? (
            <HStack gap={10}>
              <Skeleton height={34} style={{ width: 90, borderRadius: 999 }} />
              <Skeleton height={34} style={{ width: 120, borderRadius: 999 }} />
              <Skeleton height={34} style={{ width: 80, borderRadius: 999 }} />
            </HStack>
          ) : null
        }
      />
    </Animated.View>
  );
}

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);

  const { data: categories = [], isLoading: loadingCats } = useCategories();

  const categoryFilters = useMemo(
    () => [{ slug: "all", name: "All" }, ...categories],
    [categories]
  );

  const listParams = useMemo(
    () => ({
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      category: category === "all" ? undefined : category,
    }),
    [category, debouncedSearch]
  );

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteProducts(listParams);

  const products = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  const isSearchPending =
    searchQuery.trim() !== debouncedSearch.trim() ||
    (isFetching && !isFetchingNextPage && !isLoading);

  const isInitialLoading = isLoading && products.length === 0;

  const gridKey = useMemo(
    () => `${category}-${debouncedSearch.trim()}`,
    [category, debouncedSearch]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

      if (distanceFromBottom < 280 && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.id}`);
  }, []);

  return (
    <Screen padded={false}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: theme.space[8], gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage && !isSearchPending}
            onRefresh={() => void refetch()}
            tintColor={theme.colors.primary2}
          />
        }
      >
        <ShopHeader
          search={searchQuery}
          onSearchChange={setSearchQuery}
          category={category}
          onCategoryChange={setCategory}
          categoryFilters={categoryFilters}
          loadingCats={loadingCats}
          isSearching={isSearchPending}
        />

        {isInitialLoading ? (
          <MasonrySkeleton />
        ) : products.length === 0 ? (
          <View style={{ padding: theme.space[4] }}>
            <EmptyState
              title="No products found"
              description="Try a different search or category."
              actionLabel="Reset filters"
              onAction={() => {
                setSearchQuery("");
                setCategory("all");
                void refetch();
              }}
            />
          </View>
        ) : (
          <MasonryProductGrid
            key={gridKey}
            products={products}
            onPressProduct={handleProductPress}
            animate={false}
          />
        )}

        {isFetchingNextPage ? <MasonrySkeleton rows={1} /> : <View style={{ height: 16 }} />}
      </Animated.ScrollView>
    </Screen>
  );
}
