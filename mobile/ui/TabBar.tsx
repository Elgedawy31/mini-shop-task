import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/features/cart/CartContext";
import { theme } from "@/theme/theme";

const TAB_ICONS: Record<string, React.ComponentProps<typeof FontAwesome>["name"]> = {
  shop: "shopping-bag",
  cart: "shopping-cart",
  orders: "list-alt",
  profile: "user",
};

const TAB_BAR_HEIGHT = 56;

function TabItem({
  label,
  icon,
  isFocused,
  badge,
  onPress,
  onLongPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  isFocused: boolean;
  badge?: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + scale.value * 0.06 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      <Animated.View style={iconStyle}>
        <FontAwesome
          name={icon}
          size={22}
          color={isFocused ? theme.colors.primary2 : theme.colors.muted}
        />
        {badge && badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Text
        style={[
          styles.label,
          {
            color: isFocused ? theme.colors.text : theme.colors.muted,
            fontFamily: isFocused ? theme.font.semibold : theme.font.medium,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const [barWidth, setBarWidth] = useState(0);

  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withTiming(state.index, { duration: 220 });
  }, [activeIndex, state.index]);

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const count = state.routes.length || 1;
    const tabWidth = barWidth / count;
    const inset = 18;
    return {
      width: Math.max(tabWidth - inset * 2, 24),
      transform: [{ translateX: activeIndex.value * tabWidth + inset }],
    };
  });

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar} onLayout={onBarLayout}>
        {barWidth > 0 ? <Animated.View style={[styles.indicator, indicatorStyle]} /> : null}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);
          const isFocused = state.index === index;
          const icon = TAB_ICONS[route.name] ?? "circle";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              label={String(label)}
              icon={icon}
              isFocused={isFocused}
              badge={route.name === "cart" ? cartCount : undefined}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export function getTabBarHeight(bottomInset: number) {
  return TAB_BAR_HEIGHT + Math.max(bottomInset, 10);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  bar: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    alignItems: "stretch",
  },
  indicator: {
    position: "absolute",
    top: 0,
    height: 3,
    borderRadius: 999,
    backgroundColor: theme.colors.primary2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 6,
  },
  label: {
    fontSize: 11,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -12,
    minWidth: 17,
    height: 17,
    borderRadius: 999,
    paddingHorizontal: 4,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFF7ED",
    fontFamily: theme.font.bold,
    fontSize: 9,
    lineHeight: 11,
  },
});
