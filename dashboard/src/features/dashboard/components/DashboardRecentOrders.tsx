import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/atoms/card";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/shared/utils/format";
import type { RecentOrder } from "../types/dashboard";

type DashboardRecentOrdersProps = {
  recentOrders?: RecentOrder[];
  isLoading: boolean;
};

export function DashboardRecentOrders({ recentOrders, isLoading }: DashboardRecentOrdersProps) {
  return (
    <Card className="border-border/60 bg-card/85">
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>
          The latest checkouts flowing in from the store, ready for immediate admin action.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))
          : recentOrders?.map((order) => (
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
  );
}
