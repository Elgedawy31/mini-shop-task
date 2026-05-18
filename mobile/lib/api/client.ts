import axios, { type AxiosError, type AxiosInstance } from "axios";
import { env } from "@/lib/env";
import type { ApiResponse, AuthSessionPayload } from "./types";
import { sessionStore } from "@/features/auth/session";

function toFailure<T>(message: string, extra?: Partial<ApiResponse<T>>) {
  return { success: false as const, message, ...extra };
}

function parseError<T>(error: unknown): ApiResponse<T> {
  if (!axios.isAxiosError(error)) {
    return toFailure<T>(error instanceof Error ? error.message : "Unexpected error");
  }

  const axiosError = error as AxiosError<any>;
  const data = axiosError.response?.data;

  if (data && typeof data === "object") {
    const body = data as {
      success?: boolean;
      message?: string;
      error?: string;
      statusCode?: number;
      errors?: string[];
    };

    if (body.success === false || body.message) {
      return toFailure<T>(body.message ?? "Request failed", {
        error: body.error,
        statusCode: body.statusCode ?? axiosError.response?.status,
        errors: body.errors,
      });
    }
  }

  if (axiosError.response) {
    return toFailure<T>(axiosError.message, { statusCode: axiosError.response.status });
  }

  if (axiosError.request) {
    return toFailure<T>(
      __DEV__
        ? `Network error — cannot reach ${env.apiBaseUrl}. Ensure the backend is running and your phone is on the same Wi‑Fi.`
        : "Network error — please check your connection"
    );
  }

  return toFailure<T>(axiosError.message || "Request failed");
}

type RetryableConfig = any & { _retry?: boolean };

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.apiBaseUrl,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use(async (config) => {
      const stored = await sessionStore.load();
      if (stored?.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${stored.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config as RetryableConfig | undefined;
        const status = error.response?.status;

        const url = typeof original?.url === "string" ? original.url : "";
        const isAuthEndpoint =
          url.includes("/auth/login") ||
          url.includes("/auth/register") ||
          url.includes("/auth/refresh") ||
          url.includes("/auth/forgot-password") ||
          url.includes("/auth/forgotpassword");

        const isProfileMe = url.includes("/auth/me");

        if (status === 401 && original && !original._retry && !isAuthEndpoint) {
          const stored = await sessionStore.load();
          if (stored?.refreshToken) {
            original._retry = true;
            const refreshed = await this.post<AuthSessionPayload>("/auth/refresh", {
              refreshToken: stored.refreshToken,
            });
            if (refreshed.success) {
              await sessionStore.save(refreshed.data);
              original.headers = original.headers ?? {};
              original.headers.Authorization = `Bearer ${refreshed.data.token}`;
              return this.client.request(original);
            }

            if (!isProfileMe) {
              await sessionStore.clear();
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const res = await this.client.get<ApiResponse<T>>(url);
      return res.data;
    } catch (e) {
      return parseError<T>(e);
    }
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await this.client.post<ApiResponse<T>>(url, data);
      return res.data;
    } catch (e) {
      return parseError<T>(e);
    }
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await this.client.patch<ApiResponse<T>>(url, data);
      return res.data;
    } catch (e) {
      return parseError<T>(e);
    }
  }
}

export const apiClient = new ApiClient();
