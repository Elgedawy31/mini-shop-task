import { AppError } from "../errors/app-error.js";
import { createUserClient } from "../lib/supabase.js";
import type { DashboardRangeQuery } from "../schemas/dashboard.schema.js";
import type { OrderStatus } from "../types/domain.js";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

type SeriesPoint = {
  date: string;
  total: number;
};

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function rangeStart(range: DashboardRangeQuery["range"]) {
  const start = startOfDay();
  const days = range === "30d" ? 29 : 6;
  start.setDate(start.getDate() - days);
  return start;
}

function formatDayKey(value: string) {
  return value.slice(0, 10);
}

function buildDateSeries(start: Date, days: number) {
  return Array.from({ length: days }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return formatDayKey(current.toISOString());
  });
}

export async function getDashboardStats(accessToken: string) {
  const client = createUserClient(accessToken);
  const today = startOfDay();
  const isoStart = today.toISOString();

  const [ordersTodayResult, revenueResult, productsResult] = await Promise.all([
    client.from("orders").select("id", { count: "exact", head: true }).gte("created_at", isoStart),
    client.from("orders").select("total_amount").gte("created_at", isoStart),
    client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null),
  ]);

  if (ordersTodayResult.error || revenueResult.error || productsResult.error) {
    throw new AppError({
      code: "stats_fetch_failed",
      message:
        ordersTodayResult.error?.message ??
        revenueResult.error?.message ??
        productsResult.error?.message ??
        "Failed to load dashboard stats",
      statusCode: 500,
    });
  }

  const revenueToday = (revenueResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_amount),
    0
  );

  return {
    ordersToday: ordersTodayResult.count ?? 0,
    revenueToday,
    activeProducts: productsResult.count ?? 0,
  };
}

export async function getDashboardOverview(accessToken: string) {
  const client = createUserClient(accessToken);
  const today = startOfDay();
  const isoStart = today.toISOString();

  const statusCountQueries = ORDER_STATUSES.map((status) =>
    client.from("orders").select("id", { count: "exact", head: true }).eq("status", status)
  );

  const [
    ordersTodayResult,
    revenueTodayResult,
    activeProductsResult,
    recentOrdersResult,
    ...statusCountResults
  ] = await Promise.all([
    client.from("orders").select("id", { count: "exact", head: true }).gte("created_at", isoStart),
    client.from("orders").select("total_amount").gte("created_at", isoStart),
    client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null),
    client
      .from("orders")
      .select("id, status, total_amount, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(5),
    ...statusCountQueries,
  ]);

  if (
    ordersTodayResult.error ||
    revenueTodayResult.error ||
    activeProductsResult.error ||
    recentOrdersResult.error ||
    statusCountResults.some((result) => result.error)
  ) {
    throw new AppError({
      code: "overview_fetch_failed",
      message:
        ordersTodayResult.error?.message ??
        revenueTodayResult.error?.message ??
        activeProductsResult.error?.message ??
        recentOrdersResult.error?.message ??
        statusCountResults.find((result) => result.error)?.error?.message ??
        "Failed to load dashboard overview",
      statusCode: 500,
    });
  }

  const uniqueUserIds = [...new Set((recentOrdersResult.data ?? []).map((order) => order.user_id))];
  const { data: profiles, error: profilesError } =
    uniqueUserIds.length === 0
      ? { data: [], error: null }
      : await client.from("profiles").select("id, name").in("id", uniqueUserIds);

  if (profilesError) {
    throw new AppError({
      code: "overview_fetch_failed",
      message: profilesError.message,
      statusCode: 500,
    });
  }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.name]));
  const revenueToday = (revenueTodayResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_amount),
    0
  );

  const statusCounts = ORDER_STATUSES.map((status, index) => ({
    status,
    count: statusCountResults[index]?.count ?? 0,
  }));

  return {
    stats: {
      ordersToday: ordersTodayResult.count ?? 0,
      revenueToday,
      activeProducts: activeProductsResult.count ?? 0,
    },
    statusCounts,
    recentOrders: (recentOrdersResult.data ?? []).map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: Number(order.total_amount),
      createdAt: order.created_at,
      customerName: profileMap.get(order.user_id) ?? "Unknown customer",
    })),
  };
}

async function getOrdersInRange(accessToken: string, range: DashboardRangeQuery["range"]) {
  const client = createUserClient(accessToken);
  const start = rangeStart(range);
  const { data, error } = await client
    .from("orders")
    .select("created_at, total_amount")
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError({
      code: "analytics_fetch_failed",
      message: error.message,
      statusCode: 500,
    });
  }

  return data ?? [];
}

export async function getRevenueSeries(
  accessToken: string,
  range: DashboardRangeQuery["range"]
): Promise<SeriesPoint[]> {
  const start = rangeStart(range);
  const days = range === "30d" ? 30 : 7;
  const orders = await getOrdersInRange(accessToken, range);

  const totals = new Map<string, number>();
  for (const key of buildDateSeries(start, days)) {
    totals.set(key, 0);
  }

  for (const order of orders) {
    const key = formatDayKey(order.created_at);
    totals.set(key, (totals.get(key) ?? 0) + Number(order.total_amount));
  }

  return [...totals.entries()].map(([date, total]) => ({ date, total }));
}

export async function getOrdersSeries(
  accessToken: string,
  range: DashboardRangeQuery["range"]
): Promise<SeriesPoint[]> {
  const start = rangeStart(range);
  const days = range === "30d" ? 30 : 7;
  const orders = await getOrdersInRange(accessToken, range);

  const totals = new Map<string, number>();
  for (const key of buildDateSeries(start, days)) {
    totals.set(key, 0);
  }

  for (const order of orders) {
    const key = formatDayKey(order.created_at);
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  return [...totals.entries()].map(([date, total]) => ({ date, total }));
}
