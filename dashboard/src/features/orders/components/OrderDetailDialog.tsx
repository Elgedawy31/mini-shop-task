import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/atoms/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { Button } from "@/shared/components/atoms/button";
import { formatCurrency, formatDateTime } from "@/shared/utils/format";
import { useOrderDetails } from "../hooks/useOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { OrderStatus } from "../types/order";

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

type OrderDetailDialogProps = {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: OrderStatus) => void;
  isUpdating?: boolean;
};

export function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
  onStatusChange,
  isUpdating = false,
}: OrderDetailDialogProps) {
  const { data: order, isLoading, isError, error } = useOrderDetails(open ? orderId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order details</DialogTitle>
          <DialogDescription>
            Review customer, line items, and lifecycle status before updating fulfillment.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load order details."}
          </div>
        ) : order ? (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-border/70 bg-muted/20 p-3"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-muted">
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right font-semibold">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-medium">{order.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Placed</span>
                    <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium">{order.customer?.name ?? "Customer"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current status</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between border-t border-border/70 pt-4 text-base">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Update status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    value={order.status}
                    onValueChange={(value) => onStatusChange(value as OrderStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full" disabled>
                    {isUpdating ? "Updating..." : "Choose a status above to apply changes"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
