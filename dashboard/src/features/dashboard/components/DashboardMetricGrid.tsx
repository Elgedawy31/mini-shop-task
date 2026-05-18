import { Clock3, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import type { DashboardOverview } from "../types/dashboard";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { formatCompactNumber, formatCurrency } from "@/shared/utils/format";

type DashboardMetricGridProps = {
  overview?: DashboardOverview;
  isLoading: boolean;
};

export function DashboardMetricGrid({ overview, isLoading }: DashboardMetricGridProps) {
  const totalOrders = overview?.statusCounts.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const ordersToday = overview?.stats.ordersToday ?? 0;
  const revenueToday = overview?.stats.revenueToday ?? 0;
  const averageOrderValue = totalOrders > 0 ? revenueToday / Math.max(ordersToday, 1) : 0;
  const recentThroughput = overview?.recentOrders.length ?? 0;

  const cards = [
    {
      label: "Orders today",
      value: formatCompactNumber(overview?.stats.ordersToday ?? 0),
      description: "Fresh checkouts since midnight",
      icon: ShoppingBag,
      accent: "amber" as const,
    },
    {
      label: "Revenue today",
      value: formatCurrency(overview?.stats.revenueToday ?? 0),
      description: "Gross order value captured today",
      icon: TrendingUp,
      accent: "emerald" as const,
    },
    {
      label: "Active products",
      value: formatCompactNumber(overview?.stats.activeProducts ?? 0),
      description: "Catalogue items visible to shoppers",
      icon: Package,
      accent: "sky" as const,
    },
    {
      label: "Avg. order value",
      value: formatCurrency(averageOrderValue),
      description: "Average value across today's orders",
      icon: Clock3,
      accent: "rose" as const,
    },
    {
      label: "Total live orders",
      value: formatCompactNumber(totalOrders),
      description: "Combined count across all order statuses",
      icon: ShoppingBag,
      accent: "amber" as const,
    },
    {
      label: "Recent activity",
      value: formatCompactNumber(recentThroughput),
      description: "Most recent orders visible in the feed",
      icon: Clock3,
      accent: "sky" as const,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-3xl" />
          ))
        : cards.map((card) => <DashboardMetricCard key={card.label} {...card} />)}
    </section>
  );
}
