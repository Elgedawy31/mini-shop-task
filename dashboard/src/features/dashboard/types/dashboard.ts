import type { OrderStatus } from "@/features/orders/types/order";

export type DashboardStats = {
  ordersToday: number;
  revenueToday: number;
  activeProducts: number;
};

export type StatusBreakdown = {
  status: OrderStatus;
  count: number;
};

export type RecentOrder = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customerName: string;
};

export type DashboardOverview = {
  stats: DashboardStats;
  statusCounts: StatusBreakdown[];
  recentOrders: RecentOrder[];
};

export type SeriesRange = "7d" | "30d";

export type AnalyticsSeriesPoint = {
  date: string;
  total: number;
};

export type AnalyticsSeriesResponse = {
  range: SeriesRange;
  points: AnalyticsSeriesPoint[];
};
