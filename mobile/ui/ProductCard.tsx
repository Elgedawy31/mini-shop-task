import { Image, Pressable, View } from "react-native";
import { theme } from "@/theme/theme";
import type { Product } from "@/lib/api/models";
import { AppText } from "@/ui/Primitives";

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: theme.radii.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: "hidden",
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ height: 140, backgroundColor: theme.colors.surface2 }}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
        )}
      </View>
      <View style={{ padding: theme.space[3], gap: 6 }}>
        <AppText size={13} weight="semibold" numberOfLines={2}>
          {product.name}
        </AppText>
        <AppText size={12} color={theme.colors.muted} numberOfLines={1}>
          {product.category?.name ?? "Uncategorized"}
        </AppText>
        <AppText size={13} weight="bold" color="#FFF7ED">
          {product.price.toFixed(2)} EGP
        </AppText>
      </View>
    </Pressable>
  );
}
