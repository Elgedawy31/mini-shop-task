import { useState } from "react";
import { PageHeader } from "@/shared/components/organisms/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/atoms/card";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/atoms/tabs";
import { formatCurrency, formatDateLabel } from "@/shared/utils/format";
import { useOrdersSeries, useRevenueSeries } from "@/features/dashboard/hooks/useDashboard";
import type { AnalyticsSeriesPoint, SeriesRange } from "@/features/dashboard/types/dashboard";

function SimpleSeriesChart({
  points,
  formatter,
}: {
  points: AnalyticsSeriesPoint[];
  formatter: (value: number) => string;
}) {
  const max = Math.max(...points.map((point) => point.total), 1);

  return (
    <div className="space-y-4">
      <div className="grid h-72 grid-cols-[repeat(auto-fit,minmax(0,1fr))] items-end gap-2">
        {points.map((point) => (
          <div key={point.date} className="flex h-full flex-col justify-end gap-2">
            <div className="rounded-t-2xl bg-primary/15 px-1 pt-2">
              <div
                className="w-full rounded-t-xl bg-primary"
                style={{
                  height: `${Math.max((point.total / max) * 220, point.total > 0 ? 8 : 2)}px`,
                }}
              />
            </div>
            <div className="text-center text-xs text-muted-foreground">
              {formatDateLabel(point.date)}
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {points.slice(-4).map((point) => (
          <div key={point.date} className="rounded-2xl border border-border/70 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {formatDateLabel(point.date)}
            </p>
            <p className="mt-2 text-lg font-semibold">{formatter(point.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useState<SeriesRange>("7d");
  const revenueQuery = useRevenueSeries(range);
  const ordersQuery = useOrdersSeries(range);

  return (
    <div className="space-y-8 p-1">
      <PageHeader
        title="Analytics"
        description="Trend views for order volume and revenue, designed for weekly and monthly admin readouts."
      />

      <Tabs value={range} onValueChange={(value) => setRange(value as SeriesRange)}>
        <TabsList>
          <TabsTrigger value="7d">Last 7 days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 days</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Gross revenue captured from completed checkouts.</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueQuery.isLoading ? (
              <Skeleton className="h-80 w-full rounded-2xl" />
            ) : (
              <SimpleSeriesChart
                points={revenueQuery.data?.points ?? []}
                formatter={(value) => formatCurrency(value)}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Order volume</CardTitle>
            <CardDescription>Daily order creation activity from the storefront.</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersQuery.isLoading ? (
              <Skeleton className="h-80 w-full rounded-2xl" />
            ) : (
              <SimpleSeriesChart
                points={ordersQuery.data?.points ?? []}
                formatter={(value) => `${value} orders`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsPage;
