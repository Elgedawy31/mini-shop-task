import type { Product } from "@/lib/api/models";
import type { ProductCardSize } from "@/ui/ProductCard";
import { getProductCardSize } from "@/ui/ProductCard";

export type MasonryColumnItem = {
  product: Product;
  index: number;
  size: ProductCardSize;
};

export function splitMasonryColumns(products: Product[]): {
  left: MasonryColumnItem[];
  right: MasonryColumnItem[];
} {
  const left: MasonryColumnItem[] = [];
  const right: MasonryColumnItem[] = [];

  products.forEach((product, index) => {
    const item = { product, index, size: getProductCardSize(index) };
    if (index % 2 === 0) left.push(item);
    else right.push(item);
  });

  return { left, right };
}
