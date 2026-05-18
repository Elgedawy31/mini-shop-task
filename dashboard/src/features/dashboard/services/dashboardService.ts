import { apiClient } from "@/shared/services/apiClient";
import { API_CONFIG } from "@/shared/config/api";
import { unwrapResponse } from "@/shared/lib/apiResponse";
import type { ApiResponse } from "@/shared/types/api";
import type { DashboardStats } from "../types/dashboard";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>(API_CONFIG.ENDPOINTS.DASHBOARD.STATS);
  const unwrapped = unwrapResponse<DashboardStats>(
    response as ApiResponse<DashboardStats> & Record<string, unknown>
  );

  if (!unwrapped.success) {
    throw new Error(unwrapped.error ?? unwrapped.message ?? "Failed to load dashboard stats");
  }

  const stats = (unwrapped.data ?? unwrapped) as DashboardStats;

  return {
    ordersToday: Number(stats.ordersToday ?? 0),
    revenueToday: Number(stats.revenueToday ?? 0),
    activeProducts: Number(stats.activeProducts ?? 0),
  };
}
