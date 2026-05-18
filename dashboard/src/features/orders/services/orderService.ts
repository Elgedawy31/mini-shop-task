import { API_CONFIG } from "@/shared/config/api";
import { unwrapResponse } from "@/shared/lib/apiResponse";
import { apiClient } from "@/shared/services/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type { PaginatedResponse } from "@/features/products/types/product";
import type { Order, OrdersQuery, OrderStatus } from "../types/order";

function unwrapData<T>(response: ApiResponse<T>): T {
  const unwrapped = unwrapResponse<T & Record<string, unknown>>(
    response as ApiResponse<T & Record<string, unknown>> & Record<string, unknown>
  );

  if (!unwrapped.success) {
    throw new Error(unwrapped.error ?? unwrapped.message ?? "Request failed");
  }

  return (unwrapped.data ?? unwrapped) as T;
}

function buildOrdersQuery(query: OrdersQuery) {
  const searchParams = new URLSearchParams();

  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));
  if (query.status && query.status !== "all") searchParams.set("status", query.status);

  const encoded = searchParams.toString();
  return encoded
    ? `${API_CONFIG.ENDPOINTS.ORDERS.LIST}?${encoded}`
    : API_CONFIG.ENDPOINTS.ORDERS.LIST;
}

export async function fetchOrders(query: OrdersQuery): Promise<PaginatedResponse<Order>> {
  return unwrapData(await apiClient.get<PaginatedResponse<Order>>(buildOrdersQuery(query)));
}

export async function fetchOrderById(id: string): Promise<Order> {
  return unwrapData(await apiClient.get<Order>(API_CONFIG.ENDPOINTS.ORDERS.GET(id)));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return unwrapData(
    await apiClient.patch<Order>(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status })
  );
}
