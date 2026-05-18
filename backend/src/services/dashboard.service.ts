import { AppError } from "../errors/app-error.js";
import { createUserClient } from "../lib/supabase.js";

export async function getDashboardStats(accessToken: string) {
  const client = createUserClient(accessToken);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const isoStart = startOfDay.toISOString();

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
