import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated from "react-native-reanimated";

import { useAppTheme } from "@/theme/ThemeContext";
import { mutedSurfaceFill, productCardImageGradient, skeletonLineFill } from "@/theme/surfaces";
import { theme } from "@/theme/theme";
import type { Product } from "@/lib/api/models";
import { AppText } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";
import { useFadeInUp } from "@/ui/shop/useFadeInUp";

export type ProductCardSize = "large" | "compact";

const SIZES = {
  large: { image: 204, body: 92 },
  compact: { image: 118, body: 74 },
} as const;

/** Inner bottom inset so the View row is not flush with the card edge (compact only). */
const COMPACT_BODY_PADDING_BOTTOM = theme.space[4];

function cardVariantForIndex(index: number): ProductCardSize {
  const row = Math.floor(index / 2);
  const col = index % 2;
  const rowStartsLarge = row % 2 === 0;
  if (col === 0) return rowStartsLarge ? "large" : "compact";
  return rowStartsLarge ? "compact" : "large";
}

export function getProductCardSize(index: number): ProductCardSize {
  return cardVariantForIndex(index);
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
  size = "large",
  animateEnter = false,
  enterDelay = 0,
}: ProductCardProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: "100%",
          alignSelf: "flex-start",
        },
        card: {
          width: "100%",
          borderRadius: theme.radii.xl,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
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
        },
        categoryPill: {
          position: "absolute",
          top: 10,
          left: 10,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 999,
          backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.45)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.2)",
        },
        pricePill: {
          position: "absolute",
          bottom: 10,
          right: 10,
          flexDirection: "row",
          alignItems: "baseline",
          gap: 3,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: theme.radii.md,
          backgroundColor: colors.primary,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,122,24,0.4)" : "rgba(187,77,0,0.35)",
        },
        body: {
          paddingHorizontal: theme.space[3],
          paddingVertical: theme.space[3],
          gap: 5,
          justifyContent: "flex-start",
        },
        footer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
        },
        footerCompact: {
          marginTop: 6,
        },
        chevron: {
          width: 22,
          height: 22,
          borderRadius: 11,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "rgba(255,122,24,0.12)" : "rgba(234,88,12,0.10)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,122,24,0.25)" : "rgba(234,88,12,0.22)",
        },
      }),
    [colors, isDark]
  );

  const dims = SIZES[size];
  const fadeStyle = useFadeInUp(enterDelay, animateEnter);
  const imageGradient = productCardImageGradient(isDark);

  return (
    <Animated.View style={[styles.wrap, fadeStyle]}>
      <AnimatedPressable onPress={onPress} style={styles.card}>
        <View style={[styles.imageWrap, { height: dims.image }]}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}

          <LinearGradient
            colors={imageGradient}
            locations={[0.35, 0.72, 1]}
            style={StyleSheet.absoluteFill}
          />

          {product.category?.name ? (
            <View style={styles.categoryPill}>
              <AppText size={10} weight="medium" color="#F4F4F5">
                {product.category.name}
              </AppText>
            </View>
          ) : null}

          <View style={styles.pricePill}>
            <AppText size={12} weight="bold" color="#FFF7ED">
              {product.price.toFixed(0)}
            </AppText>
            <AppText size={9} weight="medium" color="rgba(255,247,237,0.75)">
              EGP
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.body,
            { height: dims.body },
            size === "compact" && { paddingBottom: COMPACT_BODY_PADDING_BOTTOM },
          ]}
        >
          <AppText
            size={size === "large" ? 14 : 13}
            weight="semibold"
            numberOfLines={size === "large" ? 2 : 1}
          >
            {product.name}
          </AppText>

          {size === "large" && product.description ? (
            <AppText size={11} color={colors.muted} numberOfLines={2}>
              {product.description}
            </AppText>
          ) : null}

          <View style={[styles.footer, size === "compact" && styles.footerCompact]}>
            <AppText size={11} color={colors.muted}>
              View
            </AppText>
            <View style={styles.chevron}>
              <FontAwesome name="chevron-right" size={9} color={colors.primary2} />
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export function ProductCardSkeleton({ size = "large" }: { size?: ProductCardSize }) {
  const { colors, isDark } = useAppTheme();
  const dims = SIZES[size];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: "100%",
          alignSelf: "flex-start",
        },
        card: {
          width: "100%",
          borderRadius: theme.radii.xl,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        },
        imageWrap: {
          backgroundColor: colors.surface2,
          overflow: "hidden",
        },
        body: {
          paddingHorizontal: theme.space[3],
          paddingVertical: theme.space[3],
          gap: 8,
          justifyContent: "flex-start",
        },
        shimmerLine: {
          borderRadius: 6,
          backgroundColor: skeletonLineFill(isDark),
        },
      }),
    [colors, isDark]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={[styles.imageWrap, { height: dims.image }]} />
        <View
          style={[
            styles.body,
            { height: dims.body },
            size === "compact" && { paddingBottom: COMPACT_BODY_PADDING_BOTTOM },
          ]}
        >
          <View style={[styles.shimmerLine, { width: "88%", height: 12 }]} />
          <View style={[styles.shimmerLine, { width: "62%", height: 10 }]} />
          {size === "large" ? (
            <View style={[styles.shimmerLine, { width: "78%", height: 10 }]} />
          ) : null}
          {size === "compact" ? (
            <View style={[styles.shimmerLine, { width: "42%", height: 10 }]} />
          ) : null}
        </View>
      </View>
    </View>
  );
}
