import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/atoms/card";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import type { StatusBreakdown } from "../types/dashboard";

type DashboardStatusPanelProps = {
  statusCounts?: StatusBreakdown[];
  isLoading: boolean;
};

export function DashboardStatusPanel({ statusCounts, isLoading }: DashboardStatusPanelProps) {
  const maxCount = Math.max(...(statusCounts?.map((item) => item.count) ?? [1]));

  return (
    <Card className="border-border/60 bg-card/85">
      <CardHeader>
        <CardTitle>Status distribution</CardTitle>
        <CardDescription>
          See which fulfillment stage is carrying the most operational weight right now.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-xl" />
            ))
          : statusCounts?.map((item) => {
              const width = maxCount === 0 ? 0 : (item.count / maxCount) * 100;

              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <OrderStatusBadge status={item.status} />
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted">
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
  );
}
