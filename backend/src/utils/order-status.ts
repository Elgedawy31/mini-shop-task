import type { OrderStatus } from "../types/domain.js";
import { AppError } from "../errors/app-error.js";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return transitions[from].includes(to);
}

export function assertStatusTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new AppError({
      code: "invalid_status_transition",
      message: `Cannot change order status from '${from}' to '${to}'`,
      statusCode: 400,
    });
  }
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
