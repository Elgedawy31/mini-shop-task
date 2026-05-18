import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "@/shared/components/organisms/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/atoms/card";
import { Button } from "@/shared/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { formatCurrency, formatDateTime } from "@/shared/utils/format";
import { useOrderRealtimeSync, useOrders, useUpdateOrderStatus } from "../hooks/useOrders";
import { OrderDetailDialog } from "../components/OrderDetailDialog";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import type { Order, OrderStatus } from "../types/order";

const STATUS_FILTERS: Array<OrderStatus | "all"> = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useOrderRealtimeSync();

  const query = useMemo(
    () => ({
      page,
      limit: 10,
      status,
    }),
    [page, status]
  );

  const { data, isLoading, isFetching } = useOrders(query);
  const updateMutation = useUpdateOrderStatus();
  const totalPages = data
    ? Math.max(1, Math.ceil(data.pagination.total / data.pagination.limit))
    : 1;

  return (
    <div className="space-y-8 p-1">
      <PageHeader
        title="Orders"
        description="Track customer orders, inspect line items, and keep fulfillment moving."
      />

      <Card className="border-border/60">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Order queue</CardTitle>
            <p className="text-sm text-muted-foreground">
              {data?.pagination.total ?? 0} orders {isFetching ? "• Syncing..." : ""}
            </p>
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as OrderStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((item) => (
                <SelectItem key={item} value={item} className="capitalize">
                  {item === "all" ? "All statuses" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-2xl" />
            ))
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Items</th>
                      <th className="px-4 py-3 font-medium">Placed</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((order) => (
                      <tr key={order.id} className="border-t border-border/60">
                        <td className="px-4 py-4 font-medium">#{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-4">{order.customer?.name ?? "Customer"}</td>
                        <td className="px-4 py-4">{order.items?.length ?? 0}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {data?.pagination.page ?? 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog
        orderId={selectedOrder?.id ?? null}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isUpdating={updateMutation.isPending}
        onStatusChange={async (nextStatus) => {
          if (!selectedOrder || selectedOrder.status === nextStatus) return;
          await updateMutation.mutateAsync({ id: selectedOrder.id, status: nextStatus });
        }}
      />
    </div>
  );
}

export default OrdersPage;
