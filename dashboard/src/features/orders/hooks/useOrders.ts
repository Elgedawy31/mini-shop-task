import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRealtimeClient } from "@/shared/services/supabaseRealtime";
import { handleApiError, showSuccess } from "@/shared/services/errorHandler";
import { DASHBOARD_QUERY_KEYS } from "@/features/dashboard/hooks/useDashboard";
import { fetchOrderById, fetchOrders, updateOrderStatus } from "../services/orderService";
import type { OrdersQuery, OrderStatus } from "../types/order";

export const ORDER_QUERY_KEYS = {
  all: ["orders"] as const,
  list: (query: OrdersQuery) => ["orders", "list", query] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

export function useOrders(query: OrdersQuery) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(query),
    queryFn: () => fetchOrders(query),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrderDetails(orderId: string | null) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId ?? "unknown"),
    queryFn: () => fetchOrderById(orderId!),
    enabled: Boolean(orderId),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.overview });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "revenue-series"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "orders-series"] });
      queryClient.setQueryData(ORDER_QUERY_KEYS.detail(order.id), order);
      showSuccess("Order status updated");
    },
    onError: (error) => {
      handleApiError(error, { context: "Orders" });
    },
  });
}

export function useOrderRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const client = getRealtimeClient();
    if (!client) return;

    const channel = client
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [queryClient]);
}
