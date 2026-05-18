import type { ReactNode } from "react";
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
import { formatCurrency } from "@/shared/utils/format";
import { useDashboardStats } from "../hooks/useDashboardStats";

function StatCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16 mt-3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
};

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums">{value}</CardTitle>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardStats();

  return (
    <div className="space-y-8 p-1">
      <PageHeader
        title="Dashboard"
        description="Overview of today's store performance — orders, revenue, and catalogue health."
      />

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error instanceof Error ? error.message : "Could not load dashboard statistics."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Orders today"
              value={String(data?.ordersToday ?? 0)}
              description="Orders placed since midnight"
              icon={<ShoppingBag className="h-5 w-5" />}
            />
            <StatCard
              title="Revenue today"
              value={formatCurrency(data?.revenueToday ?? 0)}
              description="Total from today's orders"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title="Active products"
              value={String(data?.activeProducts ?? 0)}
              description="Live items in the catalogue"
              icon={<Package className="h-5 w-5" />}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
