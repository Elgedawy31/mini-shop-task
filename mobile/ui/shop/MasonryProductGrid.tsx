import { View } from "react-native";

import { theme } from "@/theme/theme";
import type { Product } from "@/lib/api/models";
import { ProductCard } from "@/ui/ProductCard";
import { splitMasonryColumns } from "@/ui/shop/masonry";

type MasonryProductGridProps = {
  products: Product[];
  onPressProduct: (product: Product) => void;
  animate?: boolean;
};

function MasonryColumn({
  items,
  onPressProduct,
  animate,
  columnDelayOffset,
}: {
  items: ReturnType<typeof splitMasonryColumns>["left"];
  onPressProduct: (product: Product) => void;
  animate: boolean;
  columnDelayOffset: number;
}) {
  return (
    <View style={{ flex: 1, gap: 12 }}>
      {items.map((item) => (
        <ProductCard
          key={item.product.id}
          product={item.product}
          size={item.size}
          animateEnter={animate}
          enterDelay={columnDelayOffset + (item.index % 6) * 40}
          onPress={() => onPressProduct(item.product)}
        />
      ))}
    </View>
  );
}

export function MasonryProductGrid({
  products,
  onPressProduct,
  animate = true,
}: MasonryProductGridProps) {
  const { left, right } = splitMasonryColumns(products);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingHorizontal: theme.space[4],
      }}
    >
      <MasonryColumn
        items={left}
        onPressProduct={onPressProduct}
        animate={animate}
        columnDelayOffset={0}
      />
      <MasonryColumn
        items={right}
        onPressProduct={onPressProduct}
        animate={animate}
        columnDelayOffset={20}
      />
    </View>
  );
}
