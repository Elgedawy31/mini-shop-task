import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { api } from "./api";
import type { Order, Pagination } from "@/lib/api/models";
import { toast } from "@/ui/Toast";

type OrdersPage = { items: Order[]; pagination: Pagination };

export const queryKeys = {
  categories: ["categories"] as const,
  products: (params: any) => ["products", params] as const,
  product: (id: string) => ["product", id] as const,
  myOrders: (params: any) => ["myOrders", params] as const,
  myOrdersAll: ["myOrders"] as const,
  order: (id: string) => ["order", id] as const,
  me: ["me"] as const,
};

function prependOrderToMyOrdersCache(
  old: InfiniteData<OrdersPage> | undefined,
  order: Order
): InfiniteData<OrdersPage> {
  if (!old?.pages?.length) {
    return {
      pageParams: [1],
      pages: [{ items: [order], pagination: { page: 1, limit: 10, total: 1 } }],
    };
  }

  const [first, ...rest] = old.pages;
  if (first.items.some((item) => item.id === order.id)) {
    return old;
  }

  return {
    ...old,
    pages: [
      {
        ...first,
        items: [order, ...first.items],
        pagination: {
          ...first.pagination,
          total: first.pagination.total + 1,
        },
      },
      ...rest,
    ],
  };
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const res = await api.categories.list();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useProducts(params: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: async () => {
      const res = await api.products.list(params);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    keepPreviousData: true,
  });
}

export function useInfiniteProducts(params: { limit: number; search?: string; category?: string }) {
  return useInfiniteQuery({
    queryKey: queryKeys.products({ ...params, infinite: true }),
    queryFn: async ({ pageParam }) => {
      const res = await api.products.list({ ...params, page: pageParam });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.pagination;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const res = await api.products.getById(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useMyOrders(params: { page: number; limit: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.myOrders(params),
    queryFn: async () => {
      const res = await api.orders.my(params);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteMyOrders(params: { limit: number; status?: string }) {
  return useInfiniteQuery({
    queryKey: queryKeys.myOrders({ ...params, infinite: true }),
    queryFn: async ({ pageParam }) => {
      const res = await api.orders.my({ ...params, page: pageParam });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.pagination;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => {
      const res = await api.orders.getById(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { items: Array<{ productId: string; quantity: number }> }) => {
      const res = await api.orders.create(payload);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: async (order: Order) => {
      toast("success", "Order placed", `Order #${order.id.slice(0, 8)} created successfully.`);

      qc.setQueryData(queryKeys.order(order.id), order);

      qc.setQueriesData<InfiniteData<OrdersPage>>({ queryKey: queryKeys.myOrdersAll }, (old) =>
        prependOrderToMyOrdersCache(old, order)
      );

      await qc.invalidateQueries({ queryKey: queryKeys.myOrdersAll });
    },
  });
}
