import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { API_CONFIG } from "../config/api";
import { parseErrorBody, toFailureResponse } from "../lib/apiResponse";
import type { ApiClientError, ApiResponse } from "../types/api";
import { authSession } from "@/features/auth/lib/authSession";
import { refreshAccessToken } from "@/features/auth/lib/tokenRefresh";

export type { ApiResponse, ApiClientError } from "../types/api";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS.DEFAULT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = authSession.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config as RetryableConfig | undefined;
        const status = error.response?.status;

        const isAuthEndpoint =
          typeof original?.url === "string" &&
          (original.url.includes("/auth/login") ||
            original.url.includes("/auth/setup") ||
            original.url.includes("/auth/refresh") ||
            original.url.includes("/auth/register"));

        if (
          status === 401 &&
          original &&
          !original._retry &&
          !isAuthEndpoint &&
          authSession.getRefreshToken()
        ) {
          original._retry = true;
          const newToken = await refreshAccessToken();

          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            return this.client.request(original);
          }

          authSession.clear();
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: unknown): ApiClientError {
    const fallback: ApiClientError = {
      message: "An unexpected error occurred",
    };

    if (!axios.isAxiosError(error)) {
      if (error instanceof Error) {
        return { message: error.message };
      }
      return fallback;
    }

    if (error.response?.data) {
      const parsed = parseErrorBody(error.response.data);
      if (parsed) {
        return {
          ...parsed,
          status: parsed.status ?? error.response.status,
        };
      }
    }

    if (error.response) {
      return {
        message: error.message,
        status: error.response.status,
      };
    }

    if (error.request) {
      return { message: "Network error — please check your connection" };
    }

    return { message: error.message || fallback.message };
  }

  private async request<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        method,
        url,
        data,
        ...config,
      });

      const body = response.data;

      if (body && typeof body === "object" && "success" in body && body.success === false) {
        return toFailureResponse<T>({
          message: body.message ?? body.error ?? "Request failed",
          status: body.statusCode,
          error: body.error,
          errors: body.errors,
        });
      }

      return body;
    } catch (error) {
      const apiError = error as ApiClientError;
      return toFailureResponse<T>(apiError);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("get", url, undefined, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("post", url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("put", url, data, config);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>("patch", url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("delete", url, undefined, config);
  }

  async uploadFiles(
    files: File[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<{ names: string[] }>> {
    const formData = new FormData();
    files.forEach((file) => formData.append("photos", file));

    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.FILES.BULK_UPLOAD, formData, {
        headers: API_CONFIG.HEADERS.MULTIPART,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            });
          }
        },
      });

      const apiResponse = response.data as ApiResponse<{ names: string[] }> & {
        files?: Array<{ success: boolean; name: string }>;
      };

      if (apiResponse.success && apiResponse.files) {
        const names = apiResponse.files.filter((f) => f.success && f.name).map((f) => f.name);
        return { success: true, data: { names }, message: apiResponse.message };
      }

      if (apiResponse.success && apiResponse.data) {
        return apiResponse;
      }

      return {
        success: false,
        message: apiResponse.message ?? "Upload failed",
        errors: ["Invalid response from upload service"],
      };
    } catch (error) {
      return toFailureResponse(error as ApiClientError);
    }
  }

  getRawClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export { ApiClient };
