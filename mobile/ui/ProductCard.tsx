import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated from "react-native-reanimated";

import { theme } from "@/theme/theme";
import type { Product } from "@/lib/api/models";
import { AppText } from "@/ui/Primitives";
import { AnimatedPressable } from "@/ui/form/AnimatedPressable";
import { useFadeInUp } from "@/ui/shop/useFadeInUp";

export type ProductCardSize = "large" | "compact";

const SIZES = {
  large: { image: 204, body: 92 },
  compact: { image: 118, body: 60 },
} as const;

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
  const dims = SIZES[size];
  const fadeStyle = useFadeInUp(enterDelay, animateEnter);

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
            colors={["transparent", "rgba(11,11,13,0.75)", "rgba(11,11,13,0.95)"]}
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

        <View style={[styles.body, { height: dims.body }]}>
          <AppText
            size={size === "large" ? 14 : 13}
            weight="semibold"
            numberOfLines={size === "large" ? 2 : 1}
          >
            {product.name}
          </AppText>

          {size === "large" && product.description ? (
            <AppText size={11} color={theme.colors.muted} numberOfLines={2}>
              {product.description}
            </AppText>
          ) : null}

          <View style={styles.footer}>
            <AppText size={11} color={theme.colors.muted}>
              View
            </AppText>
            <View style={styles.chevron}>
              <FontAwesome name="chevron-right" size={9} color={theme.colors.primary2} />
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export function ProductCardSkeleton({ size = "large" }: { size?: ProductCardSize }) {
  const dims = SIZES[size];

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View
          style={[styles.imageWrap, { height: dims.image, backgroundColor: theme.colors.surface2 }]}
        />
        <View style={[styles.body, { height: dims.body, gap: 8 }]}>
          <View style={[styles.shimmerLine, { width: "88%", height: 12 }]} />
          <View style={[styles.shimmerLine, { width: "62%", height: 10 }]} />
          {size === "large" ? (
            <View style={[styles.shimmerLine, { width: "78%", height: 10 }]} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignSelf: "flex-start",
  },
  card: {
    width: "100%",
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  imageWrap: {
    backgroundColor: theme.colors.surface2,
    overflow: "hidden",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  categoryPill: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
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
    backgroundColor: "rgba(187,77,0,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.4)",
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
  chevron: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,122,24,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,122,24,0.25)",
  },
  shimmerLine: {
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
