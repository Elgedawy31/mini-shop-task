import { Image, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useMemo } from "react";

import { useCart } from "@/features/cart/CartContext";
import { useCheckout } from "@/features/hooks";
import { useAuth } from "@/features/auth/AuthContext";
import { theme } from "@/theme/theme";
import { formatCurrency } from "@/lib/format";
import { AppText, Button, Card, HStack, Screen, VStack } from "@/ui/Primitives";
import { EmptyState } from "@/ui/EmptyState";
import { toast } from "@/ui/Toast";

export default function Cart() {
  const cart = useCart();
  const auth = useAuth();
  const checkout = useCheckout();

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const onCheckout = async () => {
    if (!auth.session?.token) {
      toast("info", "Sign in required", "Please sign in to place an order.");
      router.replace("/(auth)/sign-in");
      return;
    }
    if (cart.items.length === 0) return;
    try {
      const order = await checkout.mutateAsync({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      cart.clear();
      router.push(`/order/${order.id}?new=1`);
    } catch (e) {
      toast("error", "Checkout failed", e instanceof Error ? e.message : "Please try again.");
    }
  };

  return (
    <Screen>
      <VStack gap={14} style={{ flex: 1 }}>
        <View style={{ gap: 4 }}>
          <AppText size={22} weight="bold">
            Cart
          </AppText>
          <AppText size={12} color={theme.colors.muted}>
            {itemCount} item{itemCount === 1 ? "" : "s"} ready for checkout
          </AppText>
        </View>

        {cart.items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Browse products and add what you like."
            actionLabel="Go to shop"
            onAction={() => router.replace("/(tabs)/shop")}
          />
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 110 }}
            >
              {cart.items.map((item) => (
                <Card key={item.productId} style={{ padding: theme.space[3] }}>
                  <HStack align="flex-start" gap={12}>
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 18,
                        overflow: "hidden",
                        backgroundColor: theme.colors.surface2,
                      }}
                    >
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{ width: "100%", height: "100%" }}
                        />
                      ) : (
                        <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
                      )}
                    </View>

                    <View style={{ flex: 1, gap: 8 }}>
                      <AppText weight="semibold" numberOfLines={2}>
                        {item.name}
                      </AppText>
                      <AppText size={12} color={theme.colors.muted}>
                        {formatCurrency(item.price)}
                      </AppText>

                      <HStack justify="space-between">
                        <HStack gap={10}>
                          <Pressable
                            onPress={() => cart.setQty(item.productId, item.quantity - 1)}
                            style={({ pressed }) => ({
                              width: 38,
                              height: 38,
                              borderRadius: 14,
                              backgroundColor: theme.colors.surface2,
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                              opacity: item.quantity <= 1 ? 0.4 : pressed ? 0.9 : 1,
                              alignItems: "center",
                              justifyContent: "center",
                            })}
                            disabled={item.quantity <= 1}
                          >
                            <AppText weight="bold">−</AppText>
                          </Pressable>
                          <View
                            style={{ width: 26, alignItems: "center", justifyContent: "center" }}
                          >
                            <AppText weight="bold">{item.quantity}</AppText>
                          </View>
                          <Pressable
                            onPress={() => cart.setQty(item.productId, item.quantity + 1)}
                            style={({ pressed }) => ({
                              width: 38,
                              height: 38,
                              borderRadius: 14,
                              backgroundColor: theme.colors.surface2,
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                              opacity: pressed ? 0.9 : 1,
                              alignItems: "center",
                              justifyContent: "center",
                            })}
                          >
                            <AppText weight="bold">+</AppText>
                          </Pressable>
                        </HStack>

                        <Pressable onPress={() => cart.remove(item.productId)}>
                          {({ pressed }) => (
                            <AppText
                              size={12}
                              weight="medium"
                              color={theme.colors.danger}
                              style={{ opacity: pressed ? 0.7 : 1 }}
                            >
                              Remove
                            </AppText>
                          )}
                        </Pressable>
                      </HStack>
                    </View>
                  </HStack>
                </Card>
              ))}
            </ScrollView>

            <View
              style={{
                position: "absolute",
                left: theme.space[4],
                right: theme.space[4],
                bottom: theme.space[4],
              }}
            >
              <Card style={{ padding: theme.space[4] }}>
                <HStack justify="space-between" style={{ marginBottom: 10 }}>
                  <AppText size={12} color={theme.colors.muted}>
                    Subtotal
                  </AppText>
                  <AppText weight="bold">{formatCurrency(cart.subtotal)}</AppText>
                </HStack>
                <Button
                  label={checkout.isPending ? "Placing order…" : "Checkout"}
                  onPress={onCheckout}
                  loading={checkout.isPending}
                />
              </Card>
            </View>
          </>
        )}
      </VStack>
    </Screen>
  );
}
