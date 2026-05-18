import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import type { ApiResponse, UploadProgress } from "../services/apiClient";

// Re-export the API client for direct use
export { apiClient };

// Generic API hooks using the professional ApiClient
export function useApiQuery<T>(key: string[], url: string, queryOptions?: Record<string, unknown>) {
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<T> => {
      const response: ApiResponse<T> = await apiClient.get(url);
      if (!response.success) {
        throw new Error(response.message || "API request failed");
      }
      return response.data as T;
    },
    ...queryOptions,
  });
}

export function useApiMutation<T, V>(
  url: string,
  method: "post" | "put" | "patch" | "delete" = "post"
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: V): Promise<T> => {
      let response: ApiResponse<T>;

      switch (method) {
        case "post":
          response = await apiClient.post(url, data);
          break;
        case "put":
          response = await apiClient.put(url, data);
          break;
        case "patch":
          response = await apiClient.patch(url, data);
          break;
        case "delete":
          response = await apiClient.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (!response.success) {
        throw new Error(response.message || "API request failed");
      }

      return response.data as T;
    },
    onSuccess: () => {
      // Invalidate and refetch queries after successful mutation
      queryClient.invalidateQueries();
    },
  });
}

// File upload hook using the professional ApiClient
export function useFileUpload() {
  return useMutation({
    mutationFn: async ({
      files,
      onProgress,
    }: {
      files: File[];
      onProgress?: (progress: UploadProgress) => void;
    }) => {
      const response = await apiClient.uploadFiles(files, onProgress);

      if (!response.success) {
        throw new Error(response.message || "File upload failed");
      }

      return response.data;
    },
  });
}
