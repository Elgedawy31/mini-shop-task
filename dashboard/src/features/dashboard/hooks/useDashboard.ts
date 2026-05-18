import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardOverview,
  fetchDashboardStats,
  fetchOrdersSeries,
  fetchRevenueSeries,
} from "../services/dashboardService";
import type { SeriesRange } from "../types/dashboard";

export const DASHBOARD_QUERY_KEYS = {
  stats: ["dashboard", "stats"] as const,
  overview: ["dashboard", "overview"] as const,
  revenueSeries: (range: SeriesRange) => ["dashboard", "revenue-series", range] as const,
  ordersSeries: (range: SeriesRange) => ["dashboard", "orders-series", range] as const,
};

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats,
    queryFn: fetchDashboardStats,
    enabled,
    staleTime: 60_000,
  });
}

export function useDashboardOverview(enabled = true) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.overview,
    queryFn: fetchDashboardOverview,
    enabled,
    staleTime: 30_000,
  });
}

export function useRevenueSeries(range: SeriesRange) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.revenueSeries(range),
    queryFn: () => fetchRevenueSeries(range),
    staleTime: 30_000,
  });
}

export function useOrdersSeries(range: SeriesRange) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.ordersSeries(range),
    queryFn: () => fetchOrdersSeries(range),
    staleTime: 30_000,
  });
}
