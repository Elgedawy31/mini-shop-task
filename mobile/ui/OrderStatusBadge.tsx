import type { OrderStatus } from "@/lib/api/models";
import { Badge } from "./Primitives";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "pending") return <Badge label="Pending" tone="info" />;
  if (status === "processing") return <Badge label="Processing" tone="warning" />;
  if (status === "shipped") return <Badge label="Shipped" tone="info" />;
  if (status === "delivered") return <Badge label="Delivered" tone="success" />;
  return <Badge label="Cancelled" tone="danger" />;
}
