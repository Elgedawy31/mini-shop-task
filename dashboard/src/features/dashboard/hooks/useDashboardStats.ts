import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../services/dashboardService";

export const DASHBOARD_QUERY_KEYS = {
  stats: ["dashboard", "stats"] as const,
};

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats,
    queryFn: fetchDashboardStats,
    enabled,
    staleTime: 60_000,
  });
}
