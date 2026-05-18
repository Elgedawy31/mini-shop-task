import { Package, ShoppingBag, TrendingUp } from "lucide-react";
import { PageHeader } from "@/shared/components/organisms/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/atoms/card";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { formatCompactNumber, formatCurrency, formatDateTime } from "@/shared/utils/format";
import { useDashboardOverview } from "../hooks/useDashboard";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";

function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardOverview();

  const stats = [
    {
      label: "Orders today",
      value: data ? formatCompactNumber(data.stats.ordersToday) : "0",
      description: "Fresh orders since midnight",
      icon: ShoppingBag,
    },
    {
      label: "Revenue today",
      value: data ? formatCurrency(data.stats.revenueToday) : formatCurrency(0),
      description: "Today's gross revenue",
      icon: TrendingUp,
    },
    {
      label: "Active products",
      value: data ? formatCompactNumber(data.stats.activeProducts) : "0",
      description: "Products currently visible to shoppers",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8 p-1">
      <PageHeader
        title="Dashboard"
        description="Daily admin pulse across orders, revenue, catalogue health, and recent activity."
      />

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load dashboard overview."}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-border/60">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-4 h-8 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="border-border/60 bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardDescription className="text-xs font-semibold uppercase tracking-[0.2em]">
                      {stat.label}
                    </CardDescription>
                    <CardTitle className="mt-3 text-3xl">{stat.value}</CardTitle>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
            <CardDescription>Current order mix across the fulfillment lifecycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-xl" />
                ))
              : data?.statusCounts.map((item) => {
                  const maxCount = Math.max(
                    ...(data.statusCounts.map((status) => status.count) || [1])
                  );
                  const width = maxCount === 0 ? 0 : (item.count / maxCount) * 100;

                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <OrderStatusBadge status={item.status} />
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              Most recent checkouts flowing in from the mobile shop.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full rounded-xl" />
                ))
              : data?.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        #{order.id.slice(0, 8)} • {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default DashboardPage;
