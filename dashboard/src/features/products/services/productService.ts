import { API_CONFIG } from "@/shared/config/api";
import { unwrapResponse } from "@/shared/lib/apiResponse";
import { apiClient } from "@/shared/services/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type {
  Category,
  PaginatedResponse,
  Product,
  ProductPayload,
  ProductsQuery,
} from "../types/product";

function buildProductsQuery(query: ProductsQuery) {
  const searchParams = new URLSearchParams();

  if (query.page) searchParams.set("page", String(query.page));
  if (query.limit) searchParams.set("limit", String(query.limit));
  if (query.search) searchParams.set("search", query.search);
  if (query.category && query.category !== "all") searchParams.set("category", query.category);
  if (query.includeInactive) searchParams.set("includeInactive", "true");

  const encoded = searchParams.toString();
  return encoded
    ? `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${encoded}`
    : API_CONFIG.ENDPOINTS.PRODUCTS.LIST;
}

function unwrapData<T>(response: ApiResponse<T>): T {
  const unwrapped = unwrapResponse<T & Record<string, unknown>>(
    response as ApiResponse<T & Record<string, unknown>> & Record<string, unknown>
  );

  if (!unwrapped.success) {
    throw new Error(unwrapped.error ?? unwrapped.message ?? "Request failed");
  }

  return (unwrapped.data ?? unwrapped) as T;
}

export async function fetchProducts(query: ProductsQuery): Promise<PaginatedResponse<Product>> {
  return unwrapData(await apiClient.get<PaginatedResponse<Product>>(buildProductsQuery(query)));
}

export async function fetchCategories(): Promise<{ items: Category[] }> {
  return unwrapData(
    await apiClient.get<{ items: Category[] }>(API_CONFIG.ENDPOINTS.CATEGORIES.LIST)
  );
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  return unwrapData(await apiClient.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, payload));
}

export async function updateProduct(id: string, payload: ProductPayload): Promise<Product> {
  return unwrapData(
    await apiClient.patch<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id), payload)
  );
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<Product> {
  return updateProduct(id, { isActive });
}

export async function deleteProduct(id: string): Promise<{ id: string; deleted: boolean }> {
  return unwrapData(
    await apiClient.delete<{ id: string; deleted: boolean }>(
      API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id)
    )
  );
}

export async function uploadProductImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient
    .getRawClient()
    .post<
      ApiResponse<{ imageUrl: string }> & Record<string, unknown>
    >(API_CONFIG.ENDPOINTS.PRODUCTS.UPLOAD_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

  return unwrapData(response.data);
}
