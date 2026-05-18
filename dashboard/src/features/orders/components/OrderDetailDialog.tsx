import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { formatCurrency, formatDateTime } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
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

function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("overflow-hidden rounded-xl border border-border/60 bg-muted/10", className)}
    >
      <div className="border-b border-border/50 px-4 py-3">
        <h3 className="text-sm font-semibold leading-none">{title}</h3>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

export function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
  onStatusChange,
  isUpdating = false,
}: OrderDetailDialogProps) {
  const { data: order, isLoading, isError, error } = useOrderDetails(open ? orderId : null);
  const itemCount = order?.items?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-4xl">
        <DialogHeader className="space-y-1.5 pr-8 text-left">
          <DialogTitle>Order details</DialogTitle>
          <DialogDescription>
            Review customer, line items, and lifecycle status before updating fulfillment.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load order details."}
          </div>
        ) : order ? (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)]">
            <Panel
              title="Items"
              description={
                itemCount === 1 ? "1 product in this order" : `${itemCount} products in this order`
              }
            >
              {itemCount === 0 ? (
                <p className="text-sm text-muted-foreground">No line items for this order.</p>
              ) : (
                <ul className="space-y-2">
                  {order.items?.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 p-3"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">—</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <div className="flex flex-col gap-4">
              <Panel title="Order summary">
                <div className="space-y-3 text-sm">
                  <SummaryRow label="Order ID">
                    <span className="font-mono text-xs">{order.id.slice(0, 8)}</span>
                  </SummaryRow>
                  <SummaryRow label="Placed">{formatDateTime(order.createdAt)}</SummaryRow>
                  <SummaryRow label="Customer">{order.customer?.name ?? "Customer"}</SummaryRow>
                  <SummaryRow label="Current status">
                    <OrderStatusBadge status={order.status} />
                  </SummaryRow>
                  <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-3">
                    <span className="font-medium">Total</span>
                    <span className="text-base font-semibold tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </Panel>

              <Panel title="Update status">
                <div className="space-y-3">
                  <Select
                    value={order.status}
                    disabled={isUpdating}
                    onValueChange={(value) => onStatusChange(value as OrderStatus)}
                  >
                    <SelectTrigger className="w-full capitalize">
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
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {isUpdating
                      ? "Saving status change…"
                      : "Pick a new status to update fulfillment immediately."}
                  </p>
                </div>
              </Panel>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
