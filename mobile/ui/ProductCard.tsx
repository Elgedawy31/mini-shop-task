import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/ThemeContext";
import { mutedSurfaceFill, productCardImageGradient, skeletonLineFill } from "@/theme/surfaces";
import { theme } from "@/theme/theme";
import type { Product } from "@/lib/api/models";
import { AppText } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";
import { useFadeInUp } from "@/ui/shop/useFadeInUp";

export type ProductCardSize = "featured" | "standard" | "compact";

const SIZES = {
  featured: { image: 252, body: 104, radius: theme.radii.xl + 4 },
  standard: { image: 172, body: 82, radius: theme.radii.xl },
  compact: { image: 108, body: 68, radius: theme.radii.lg },
} as const;

const SIZE_PATTERN: ProductCardSize[] = [
  "featured",
  "compact",
  "standard",
  "compact",
  "featured",
  "standard",
];

export function getProductCardSize(index: number): ProductCardSize {
  return SIZE_PATTERN[index % SIZE_PATTERN.length] ?? "standard";
}

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  size?: ProductCardSize;
  animateEnter?: boolean;
  enterDelay?: number;
};

export function ProductCard({
  product,
  onPress,
  size = "standard",
  animateEnter = false,
  enterDelay = 0,
}: ProductCardProps) {
  const { colors, isDark } = useAppTheme();
  const pressLift = useSharedValue(0);
  const dims = SIZES[size];
  const isFeatured = size === "featured";
  const isCompact = size === "compact";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: "100%",
          alignSelf: "flex-start",
        },
        card: {
          width: "100%",
          borderRadius: dims.radius,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: isFeatured
            ? isDark
              ? "rgba(255,122,24,0.35)"
              : "rgba(234,88,12,0.28)"
            : colors.border,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: isFeatured ? 14 : 8 },
          shadowOpacity: isDark ? (isFeatured ? 0.45 : 0.32) : isFeatured ? 0.14 : 0.08,
          shadowRadius: isFeatured ? 20 : 12,
          elevation: isFeatured ? 10 : 5,
        },
        accentBar: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          backgroundColor: colors.primary2,
          opacity: isFeatured ? 0.9 : 0,
        },
        imageWrap: {
          backgroundColor: colors.surface2,
          overflow: "hidden",
        },
        image: {
          ...StyleSheet.absoluteFillObject,
          width: "100%",
          height: "100%",
        },
        imagePlaceholder: {
          flex: 1,
          backgroundColor: mutedSurfaceFill(isDark),
          alignItems: "center",
          justifyContent: "center",
        },
        categoryPill: {
          position: "absolute",
          top: isCompact ? 8 : 12,
          left: isCompact ? 8 : 12,
          paddingHorizontal: isCompact ? 8 : 10,
          paddingVertical: isCompact ? 4 : 5,
          borderRadius: 999,
          backgroundColor: isDark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.48)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.16)",
        },
        priceTag: {
          position: "absolute",
          bottom: isCompact ? 8 : 12,
          right: isCompact ? 8 : 12,
          flexDirection: "row",
          alignItems: "baseline",
          gap: 3,
          paddingHorizontal: isFeatured ? 12 : 10,
          paddingVertical: isFeatured ? 8 : 6,
          borderRadius: theme.radii.md,
          backgroundColor: colors.primary,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,122,24,0.45)" : "rgba(187,77,0,0.35)",
        },
        body: {
          paddingHorizontal: theme.space[3],
          paddingTop: theme.space[3],
          paddingBottom: isCompact ? theme.space[2] : theme.space[3],
          gap: isCompact ? 4 : 6,
          justifyContent: "flex-start",
        },
        metaRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: isCompact ? 4 : 6,
        },
        cta: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 999,
          backgroundColor: isDark ? "rgba(255,122,24,0.14)" : "rgba(234,88,12,0.10)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,122,24,0.28)" : "rgba(234,88,12,0.22)",
        },
      }),
    [colors, dims.radius, isCompact, isDark, isFeatured]
  );

  const fadeStyle = useFadeInUp(enterDelay, animateEnter);
  const imageGradient = productCardImageGradient(isDark);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(pressLift.value, [0, 1], [0, -3], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.wrap, fadeStyle, liftStyle]}>
      <AnimatedPressable
        onPress={onPress}
        style={styles.card}
        onPressIn={() => {
          pressLift.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          pressLift.value = withSpring(0, { damping: 18, stiffness: 320 });
        }}
      >
        <View style={[styles.imageWrap, { height: dims.image }]}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <FontAwesome name="image" size={isFeatured ? 28 : 20} color={colors.muted} />
            </View>
          )}

          <LinearGradient
            colors={imageGradient}
            locations={[0.2, 0.65, 1]}
            style={StyleSheet.absoluteFill}
          />

          {product.category?.name ? (
            <View style={styles.categoryPill}>
              <AppText size={isCompact ? 9 : 10} weight="medium" color="#F4F4F5">
                {product.category.name}
              </AppText>
            </View>
          ) : null}

          <View style={styles.priceTag}>
            <AppText size={isFeatured ? 14 : 12} weight="bold" color="#FFF7ED">
              {product.price.toFixed(0)}
            </AppText>
            <AppText size={9} weight="medium" color="rgba(255,247,237,0.78)">
              EGP
            </AppText>
          </View>
        </View>

        <View style={[styles.body, { minHeight: dims.body }]}>
          <AppText
            size={isFeatured ? 15 : isCompact ? 12 : 13}
            weight="bold"
            numberOfLines={isFeatured ? 2 : 1}
          >
            {product.name}
          </AppText>

          {!isCompact && product.description ? (
            <AppText size={11} color={colors.muted} numberOfLines={isFeatured ? 2 : 1}>
              {product.description}
            </AppText>
          ) : null}

          <View style={styles.metaRow}>
            <AppText size={10} color={colors.muted}>
              {isFeatured ? "Featured pick" : "Tap to view"}
            </AppText>
            <View style={styles.cta}>
              <AppText size={10} weight="semibold" color={colors.primary2}>
                Open
              </AppText>
              <FontAwesome name="chevron-right" size={8} color={colors.primary2} />
            </View>
          </View>
        </View>

        <View style={styles.accentBar} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export function ProductCardSkeleton({ size = "standard" }: { size?: ProductCardSize }) {
  const { colors, isDark } = useAppTheme();
  const dims = SIZES[size];
  const isFeatured = size === "featured";
  const isCompact = size === "compact";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: "100%",
          alignSelf: "flex-start",
        },
        card: {
          width: "100%",
          borderRadius: dims.radius,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        },
        imageWrap: {
          backgroundColor: colors.surface2,
        },
        body: {
          paddingHorizontal: theme.space[3],
          paddingVertical: theme.space[3],
          gap: 8,
        },
        shimmerLine: {
          borderRadius: 6,
          backgroundColor: skeletonLineFill(isDark),
        },
      }),
    [colors, dims.radius, isDark]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={[styles.imageWrap, { height: dims.image }]} />
        <View style={[styles.body, { minHeight: dims.body }]}>
          <View style={[styles.shimmerLine, { width: isFeatured ? "92%" : "85%", height: 13 }]} />
          {!isCompact ? <View style={[styles.shimmerLine, { width: "70%", height: 10 }]} /> : null}
          {isFeatured ? <View style={[styles.shimmerLine, { width: "55%", height: 10 }]} /> : null}
          <View style={[styles.shimmerLine, { width: "40%", height: 10, marginTop: 4 }]} />
        </View>
      </View>
    </View>
  );
}
