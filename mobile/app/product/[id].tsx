import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useProduct } from "@/features/hooks";
import { useCart } from "@/features/cart/CartContext";
import { theme } from "@/theme/theme";
import { formatCurrency } from "@/lib/format";
import { AppText, Button, Card, HStack, VStack } from "@/ui/Primitives";
import { Skeleton } from "@/ui/Skeleton";
import { toast } from "@/ui/Toast";
import { AddToCartButton } from "@/ui/shop/AddToCartButton";
import { ProductDetailBackButton } from "@/ui/shop/ProductDetailBackButton";

const HERO_HEIGHT = 380;

export default function ProductDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? "");
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isFetching } = useProduct(id);
  const cart = useCart();

  const [qty, setQty] = useState(1);

  const product = data;
  const canAdd = Boolean(product) && qty > 0;
  const canDec = qty > 1;
  const canInc = qty < 20;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {isLoading ? (
          <View style={styles.hero}>
            <Skeleton height={HERO_HEIGHT} style={{ borderRadius: 0 }} />
          </View>
        ) : null}

        {!isLoading && product ? (
          <>
            <View style={styles.hero}>
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.heroPlaceholder} />
              )}

              <LinearGradient
                colors={["rgba(11,11,13,0.72)", "rgba(11,11,13,0.2)", "transparent"]}
                locations={[0, 0.45, 1]}
                style={[styles.heroTopFade, { height: insets.top + 88 }]}
                pointerEvents="none"
              />
              <LinearGradient
                colors={["transparent", "rgba(11,11,13,0.95)"]}
                style={styles.heroBottomFade}
                pointerEvents="none"
              />
            </View>

            <View style={styles.content}>
              <VStack gap={8}>
                <AppText size={22} weight="bold">
                  {product.name}
                </AppText>
                <AppText size={13} color={theme.colors.muted}>
                  {product.category?.name ?? "Uncategorized"}
                </AppText>
                <AppText size={18} weight="bold" color="#FFF7ED">
                  {formatCurrency(product.price)}
                </AppText>
              </VStack>

              <Card>
                <VStack gap={10}>
                  <AppText size={14} weight="semibold">
                    About
                  </AppText>
                  <AppText size={13} color={theme.colors.muted}>
                    {product.description?.trim() ? product.description : "No description provided."}
                  </AppText>
                </VStack>
              </Card>

              <Card>
                <HStack justify="space-between">
                  <VStack gap={2}>
                    <AppText size={14} weight="semibold">
                      Quantity
                    </AppText>
                    <AppText size={12} color={theme.colors.muted}>
                      Up to 20 per order
                    </AppText>
                  </VStack>

                  <HStack gap={10}>
                    <Pressable
                      onPress={() => canDec && setQty((q) => Math.max(1, q - 1))}
                      style={({ pressed }) => ({
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        backgroundColor: theme.colors.surface2,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        opacity: !canDec ? 0.4 : pressed ? 0.9 : 1,
                        alignItems: "center",
                        justifyContent: "center",
                      })}
                    >
                      <AppText weight="bold" size={16}>
                        −
                      </AppText>
                    </Pressable>
                    <View style={{ minWidth: 36, alignItems: "center", justifyContent: "center" }}>
                      <AppText weight="bold" size={16}>
                        {qty}
                      </AppText>
                    </View>
                    <Pressable
                      onPress={() => canInc && setQty((q) => Math.min(20, q + 1))}
                      style={({ pressed }) => ({
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        backgroundColor: theme.colors.surface2,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        opacity: !canInc ? 0.4 : pressed ? 0.9 : 1,
                        alignItems: "center",
                        justifyContent: "center",
                      })}
                    >
                      <AppText weight="bold" size={16}>
                        +
                      </AppText>
                    </Pressable>
                  </HStack>
                </HStack>
              </Card>
            </View>
          </>
        ) : null}

        {!isLoading && !product ? (
          <View style={[styles.content, { paddingTop: insets.top + 72 }]}>
            <Card>
              <VStack gap={10}>
                <AppText weight="bold">Product not found</AppText>
                <AppText size={13} color={theme.colors.muted}>
                  Pull to refresh or go back to the catalogue.
                </AppText>
                <Button
                  label={isFetching ? "Refreshing…" : "Refresh"}
                  onPress={() => void refetch()}
                  loading={isFetching}
                />
              </VStack>
            </Card>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.content}>
            <Skeleton height={24} />
            <Skeleton height={18} style={{ width: "70%" }} />
            <Skeleton height={120} style={{ borderRadius: theme.radii.xl }} />
          </View>
        ) : null}
      </ScrollView>

      <ProductDetailBackButton />

      <View
        style={[
          styles.footer,
          {
            paddingBottom: theme.space[4] + insets.bottom,
          },
        ]}
      >
        <AddToCartButton
          disabled={!canAdd}
          loading={!product}
          onAdd={() => {
            if (!product) return;
            cart.add(product, qty);
            toast("success", "Added to cart", `${qty} × ${product.name}`);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: theme.colors.surface2,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroTopFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  heroBottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  content: {
    padding: theme.space[4],
    gap: 16,
    marginTop: -theme.space[6],
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.space[4],
    backgroundColor: "rgba(11,11,13,0.92)",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
