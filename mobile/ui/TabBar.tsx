import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/features/cart/CartContext";
import { theme } from "@/theme/theme";

const TAB_ICONS: Record<string, React.ComponentProps<typeof FontAwesome>["name"]> = {
  shop: "shopping-bag",
  cart: "shopping-cart",
  orders: "list-alt",
  profile: "user",
};

const SPRING = { damping: 16, stiffness: 220, mass: 0.8 };

export function getTabBarInset(bottomSafeArea: number) {
  return 76 + Math.max(bottomSafeArea, 12);
}

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
  const focus = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focus.value = withSpring(isFocused ? 1 : 0, SPRING);
  }, [focus, isFocused]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scale: 0.88 + focus.value * 0.12 }],
  }));

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + focus.value * 0.1 }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(focus.value, [0, 1], [theme.colors.muted, theme.colors.primary2]),
    opacity: 0.72 + focus.value * 0.28,
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
      <Animated.View style={[styles.activePill, pillStyle]} />
      <Animated.View style={[styles.iconWrap, iconWrapStyle]}>
        <FontAwesome
          name={icon}
          size={20}
          color={isFocused ? theme.colors.primary2 : theme.colors.muted}
        />
        {badge && badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.bar}>
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

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.space[4],
    paddingTop: theme.space[2],
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20,20,25,0.96)",
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 5,
    minHeight: 56,
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 4,
    marginVertical: 2,
    borderRadius: theme.radii.lg,
    backgroundColor: "rgba(255,122,24,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.28)",
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: theme.font.medium,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 5,
    backgroundColor: theme.colors.primary2,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFF7ED",
    fontFamily: theme.font.bold,
    fontSize: 10,
    lineHeight: 12,
  },
});
