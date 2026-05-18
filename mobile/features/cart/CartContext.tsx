import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/api/models";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isHydrating: boolean;
  subtotal: number;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const KEY = "mini_shop_cart_v1";

const CartContext = createContext<CartState | null>(null);

async function persist(items: CartItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrating, setHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (cancelled) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CartItem[];
          setItems(Array.isArray(parsed) ? parsed : []);
        } catch {
          setItems([]);
        }
      }
      setHydrating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CartState>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      items,
      isHydrating,
      subtotal,
      add(product, qty = 1) {
        setItems((prev) => {
          const next = [...prev];
          const existing = next.find((i) => i.productId === product.id);
          if (existing) {
            existing.quantity = existing.quantity + qty;
          } else {
            next.push({
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity: qty,
            });
          }
          void persist(next);
          return next;
        });
      },
      setQty(productId, qty) {
        setItems((prev) => {
          const next = prev
            .map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
            .filter((i) => i.quantity > 0);
          void persist(next);
          return next;
        });
      },
      remove(productId) {
        setItems((prev) => {
          const next = prev.filter((i) => i.productId !== productId);
          void persist(next);
          return next;
        });
      },
      clear() {
        setItems([]);
        void persist([]);
      },
    };
  }, [items, isHydrating]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
