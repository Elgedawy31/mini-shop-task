import { apiClient } from "@/lib/api/client";
import type { ApiResponse, AuthSessionPayload } from "@/lib/api/types";
import type { Category, Order, Pagination, Product } from "@/lib/api/models";

export const api = {
  auth: {
    login(input: { email: string; password: string }): Promise<ApiResponse<AuthSessionPayload>> {
      return apiClient.post<AuthSessionPayload>("/auth/login", input);
    },
    register(input: {
      name: string;
      email: string;
      password: string;
    }): Promise<ApiResponse<AuthSessionPayload>> {
      return apiClient.post<AuthSessionPayload>("/auth/register", input);
    },
    forgotPassword(input: { email: string }): Promise<ApiResponse<void>> {
      return apiClient.post<void>("/auth/forgot-password", input);
    },
    me(): Promise<ApiResponse<{ user: AuthSessionPayload["user"] }>> {
      return apiClient.get<{ user: AuthSessionPayload["user"] }>("/auth/me");
    },
  },

  categories: {
    async list(): Promise<ApiResponse<Category[]>> {
      const res = await apiClient.get<{ items: Category[] }>("/categories");
      if (!res.success) return res;
      return { success: true, data: res.data.items ?? [], message: res.message };
    },
  },

  products: {
    list(query: {
      page: number;
      limit: number;
      search?: string;
      category?: string;
    }): Promise<ApiResponse<{ items: Product[]; pagination: Pagination }>> {
      const params = new URLSearchParams();
      params.set("page", String(query.page));
      params.set("limit", String(query.limit));
      if (query.search) params.set("search", query.search);
      if (query.category) params.set("category", query.category);
      // Mobile should only show active products.
      params.set("includeInactive", "false");
      return apiClient.get<{ items: Product[]; pagination: Pagination }>(`/products?${params}`);
    },
    getById(id: string): Promise<ApiResponse<Product>> {
      return apiClient.get<Product>(`/products/${id}`);
    },
  },

  orders: {
    create(input: {
      items: Array<{ productId: string; quantity: number }>;
    }): Promise<ApiResponse<Order>> {
      return apiClient.post<Order>("/orders", input);
    },
    my(query: {
      page: number;
      limit: number;
      status?: string;
    }): Promise<ApiResponse<{ items: Order[]; pagination: Pagination }>> {
      const params = new URLSearchParams();
      params.set("page", String(query.page));
      params.set("limit", String(query.limit));
      if (query.status) params.set("status", query.status);
      return apiClient.get<{ items: Order[]; pagination: Pagination }>(`/orders/my?${params}`);
    },
    getById(id: string): Promise<ApiResponse<Order>> {
      return apiClient.get<Order>(`/orders/${id}`);
    },
  },
};
