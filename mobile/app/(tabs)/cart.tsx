import { useCallback, useEffect } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useCart, type CartItem } from "@/features/cart/CartContext";
import { useCheckout } from "@/features/hooks";
import { useAuth } from "@/features/auth/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme/theme";
import { AppText, Screen } from "@/ui/Primitives";
import { Skeleton } from "@/ui/Skeleton";
import { toast } from "@/ui/Toast";
import { CartEmptyState } from "@/ui/cart/CartEmptyState";
import { CartLineItem } from "@/ui/cart/CartLineItem";
import { CartSummaryBar } from "@/ui/cart/CartSummaryBar";

function CartHeader({ itemCount }: { itemCount: number }) {
  const { colors, isDark } = useAppTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  }, [opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: theme.space[4],
          paddingTop: theme.space[4],
          paddingBottom: theme.space[3],
          gap: 4,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AppText size={22} weight="bold">
          Cart
        </AppText>
        {itemCount > 0 ? (
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
              {itemCount}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText size={12} color={colors.muted}>
        {itemCount === 0
          ? "Add products from the shop to get started"
          : `${itemCount} item${itemCount === 1 ? "" : "s"} ready for checkout`}
      </AppText>
    </Animated.View>
  );
}

function CartLineSkeleton() {
  return <Skeleton height={148} style={{ borderRadius: theme.radii.xl }} />;
}

export default function Cart() {
  const cart = useCart();
  const auth = useAuth();
  const checkout = useCheckout();

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const onCheckout = useCallback(async () => {
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
  }, [auth.session?.token, cart, checkout]);

  const renderItem = useCallback(
    ({ item, index }: { item: CartItem; index: number }) => (
      <CartLineItem
        item={item}
        index={index}
        onDecrease={() => cart.setQty(item.productId, item.quantity - 1)}
        onIncrease={() => cart.setQty(item.productId, item.quantity + 1)}
        onRemove={() => cart.remove(item.productId)}
      />
    ),
    [cart]
  );

  const listHeader = <CartHeader itemCount={itemCount} />;

  if (cart.isHydrating) {
    return (
      <Screen padded={false}>
        {listHeader}
        <View style={{ paddingHorizontal: theme.space[4], gap: 12 }}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <CartLineSkeleton key={idx} />
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList<CartItem>
        data={cart.items}
        keyExtractor={(item) => item.productId}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{
          paddingHorizontal: theme.space[4],
          paddingBottom: cart.items.length > 0 ? 200 : theme.space[8],
          gap: 12,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={<CartEmptyState />}
      />

      {cart.items.length > 0 ? (
        <CartSummaryBar
          itemCount={itemCount}
          subtotal={cart.subtotal}
          loading={checkout.isPending}
          onCheckout={onCheckout}
        />
      ) : null}
    </Screen>
  );
}
