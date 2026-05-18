import { API_CONFIG } from "@/shared/config/api";
import { unwrapResponse } from "@/shared/lib/apiResponse";
import { apiClient } from "@/shared/services/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type {
  AnalyticsSeriesResponse,
  DashboardOverview,
  DashboardStats,
  SeriesRange,
} from "../types/dashboard";

function unwrapData<T>(response: ApiResponse<T>): T {
  const unwrapped = unwrapResponse<T & Record<string, unknown>>(
    response as ApiResponse<T & Record<string, unknown>> & Record<string, unknown>
  );

  if (!unwrapped.success) {
    throw new Error(unwrapped.error ?? unwrapped.message ?? "Failed to load dashboard data");
  }

  return (unwrapped.data ?? unwrapped) as T;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return unwrapData(await apiClient.get<DashboardStats>(API_CONFIG.ENDPOINTS.DASHBOARD.STATS));
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return unwrapData(
    await apiClient.get<DashboardOverview>(API_CONFIG.ENDPOINTS.DASHBOARD.OVERVIEW)
  );
}

export async function fetchRevenueSeries(range: SeriesRange): Promise<AnalyticsSeriesResponse> {
  return unwrapData(
    await apiClient.get<AnalyticsSeriesResponse>(
      `${API_CONFIG.ENDPOINTS.DASHBOARD.REVENUE_SERIES}?range=${range}`
    )
  );
}

export async function fetchOrdersSeries(range: SeriesRange): Promise<AnalyticsSeriesResponse> {
  return unwrapData(
    await apiClient.get<AnalyticsSeriesResponse>(
      `${API_CONFIG.ENDPOINTS.DASHBOARD.ORDERS_SERIES}?range=${range}`
    )
  );
}
