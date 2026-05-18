import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError, showSuccess } from "@/shared/services/errorHandler";
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  toggleProductActive,
  updateProduct,
  uploadProductImage,
} from "../services/productService";
import type { ProductPayload, ProductsQuery } from "../types/product";

export const PRODUCT_QUERY_KEYS = {
  all: ["products"] as const,
  list: (query: ProductsQuery) => ["products", "list", query] as const,
  categories: ["products", "categories"] as const,
};

export function useProducts(query: ProductsQuery) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(query),
    queryFn: () => fetchProducts(query),
    placeholderData: (previousData) => previousData,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.categories,
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });
}

function useProductMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  successMessage: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showSuccess(successMessage);
    },
    onError: (error) => {
      handleApiError(error, { context: "Products" });
    },
  });
}

export function useCreateProduct() {
  return useProductMutation((payload: ProductPayload) => createProduct(payload), "Product created");
}

export function useUpdateProduct() {
  return useProductMutation(
    ({ id, payload }: { id: string; payload: ProductPayload }) => updateProduct(id, payload),
    "Product updated"
  );
}

export function useToggleProductActive() {
  return useProductMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) => toggleProductActive(id, isActive),
    "Product visibility updated"
  );
}

export function useDeleteProduct() {
  return useProductMutation((id: string) => deleteProduct(id), "Product archived");
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: uploadProductImage,
    onError: (error) => {
      handleApiError(error, { context: "Product image upload" });
    },
  });
}
