import { useState } from "react";
import { BarChart3, ShoppingBag, Sparkles, TrendingUp } from "lucide-react";
import { PageHeader } from "@/shared/components/organisms/PageHeader";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { formatCompactNumber, formatCurrency, formatDateLabel } from "@/shared/utils/format";
import { useOrdersSeries, useRevenueSeries } from "@/features/dashboard/hooks/useDashboard";
import type { AnalyticsSeriesPoint, SeriesRange } from "@/features/dashboard/types/dashboard";
import { AnalyticsChartCard } from "../components/AnalyticsChartCard";
import { AnalyticsHero } from "../components/AnalyticsHero";
import { AnalyticsMetricCard } from "../components/AnalyticsMetricCard";

function AnalyticsPage() {
  const [range, setRange] = useState<SeriesRange>("7d");
  const revenueQuery = useRevenueSeries(range);
  const ordersQuery = useOrdersSeries(range);

  const revenuePoints = revenueQuery.data?.points ?? [];
  const orderPoints = ordersQuery.data?.points ?? [];

  const totalRevenue = revenuePoints.reduce((sum, point) => sum + point.total, 0);
  const totalOrders = orderPoints.reduce((sum, point) => sum + point.total, 0);
  const bestRevenueDay = revenuePoints.reduce<AnalyticsSeriesPoint | null>(
    (best, point) => (!best || point.total > best.total ? point : best),
    null
  );
  const bestOrdersDay = orderPoints.reduce<AnalyticsSeriesPoint | null>(
    (best, point) => (!best || point.total > best.total ? point : best),
    null
  );

  return (
    <div className="space-y-8 p-1">
      <PageHeader
        title="Analytics"
        description="Performance trends for revenue and order flow, shaped for admin readouts instead of placeholder charts."
      />

      <AnalyticsHero range={range} onRangeChange={setRange} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {revenueQuery.isLoading || ordersQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-3xl" />
          ))
        ) : (
          <>
            <AnalyticsMetricCard
              title="Revenue Total"
              value={formatCurrency(totalRevenue)}
              hint={`${range === "7d" ? "Weekly" : "Monthly"} captured revenue`}
              icon={TrendingUp}
            />
            <AnalyticsMetricCard
              title="Orders Total"
              value={formatCompactNumber(totalOrders)}
              hint={`${range === "7d" ? "Weekly" : "Monthly"} order volume`}
              icon={ShoppingBag}
            />
            <AnalyticsMetricCard
              title="Best Revenue Day"
              value={bestRevenueDay ? formatCurrency(bestRevenueDay.total) : formatCurrency(0)}
              hint={bestRevenueDay ? formatDateLabel(bestRevenueDay.date) : "No revenue yet"}
              icon={BarChart3}
            />
            <AnalyticsMetricCard
              title="Best Order Day"
              value={bestOrdersDay ? `${bestOrdersDay.total}` : "0"}
              hint={bestOrdersDay ? formatDateLabel(bestOrdersDay.date) : "No orders yet"}
              icon={Sparkles}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AnalyticsChartCard
          title="Revenue trend"
          description="A cleaner earnings view with less visual noise and a better empty state."
          isLoading={revenueQuery.isLoading}
          points={revenuePoints}
          tone="revenue"
          valueFormatter={(value) => formatCurrency(value)}
          emptyTitle="No revenue in this range yet"
          emptyDescription="Once the store starts receiving paid orders, this chart will turn into a proper trend view instead of a flat placeholder."
        />

        <AnalyticsChartCard
          title="Order volume"
          description="Daily storefront activity with a softer chart treatment and clearer summary."
          isLoading={ordersQuery.isLoading}
          points={orderPoints}
          tone="orders"
          valueFormatter={(value) => `${value} orders`}
          emptyTitle="No orders recorded in this range"
          emptyDescription="When new orders start landing, this chart will show the pace of activity day by day instead of a long strip of zero bars."
        />
      </section>
    </div>
  );
}

export default AnalyticsPage;
