import { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";

import { useCategories, useProducts } from "@/features/hooks";
import { theme } from "@/theme/theme";
import { AppText, HStack, Screen, VStack } from "@/ui/Primitives";
import { Skeleton } from "@/ui/Skeleton";
import { EmptyState } from "@/ui/EmptyState";
import { ProductCard } from "@/ui/ProductCard";

const PAGE_SIZE = 12;

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: categories, isLoading: loadingCats } = useCategories();
  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search.trim() ? search.trim() : undefined,
      category: category === "all" ? undefined : category,
    }),
    [category, page, search]
  );

  const { data, isLoading, isFetching, refetch } = useProducts(params);

  const totalPages = data
    ? Math.max(1, Math.ceil(data.pagination.total / data.pagination.limit))
    : 1;

  return (
    <Screen padded={false}>
      <View
        style={{
          paddingHorizontal: theme.space[4],
          paddingTop: theme.space[6],
          paddingBottom: theme.space[3],
          gap: 12,
        }}
      >
        <View style={{ gap: 4 }}>
          <AppText size={22} weight="bold">
            Shop
          </AppText>
          <AppText size={12} color={theme.colors.muted}>
            Search and filter products, then add to cart.
          </AppText>
        </View>

        <TextInput
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            setPage(1);
          }}
          placeholder="Search products"
          placeholderTextColor="rgba(244,244,245,0.35)"
          style={{
            height: 48,
            borderRadius: theme.radii.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface2,
            paddingHorizontal: theme.space[4],
            color: theme.colors.text,
            fontFamily: theme.font.regular,
            fontSize: 14,
          }}
        />

        <FlatList
          data={[{ slug: "all", name: "All" }, ...(categories ?? [])]}
          keyExtractor={(item) => item.slug}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
          renderItem={({ item }) => {
            const active = category === item.slug;
            return (
              <Pressable
                onPress={() => {
                  setCategory(item.slug);
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
                  {item.name}
                </AppText>
              </Pressable>
            );
          }}
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
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: theme.space[4], gap: 12 }}>
          <HStack gap={12}>
            <Skeleton height={230} style={{ flex: 1 }} />
            <Skeleton height={230} style={{ flex: 1 }} />
          </HStack>
          <HStack gap={12}>
            <Skeleton height={230} style={{ flex: 1 }} />
            <Skeleton height={230} style={{ flex: 1 }} />
          </HStack>
        </View>
      ) : data && data.items.length === 0 ? (
        <View style={{ padding: theme.space[4] }}>
          <EmptyState
            title="No products found"
            description="Try a different search or category."
            actionLabel="Reset filters"
            onAction={() => {
              setSearch("");
              setCategory("all");
              setPage(1);
              void refetch();
            }}
          />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: theme.space[4] }}
          contentContainerStyle={{ gap: 12, paddingBottom: theme.space[8] }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (isFetching) return;
            if (page < totalPages) setPage((p) => p + 1);
          }}
          onEndReachedThreshold={0.35}
          refreshing={isFetching}
          onRefresh={() => void refetch()}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
          )}
          ListFooterComponent={
            page < totalPages ? (
              <View style={{ paddingHorizontal: theme.space[4], paddingTop: 10 }}>
                <Skeleton height={56} style={{ borderRadius: theme.radii.xl }} />
              </View>
            ) : (
              <View style={{ height: 24 }} />
            )
          }
        />
      )}
    </Screen>
  );
}
