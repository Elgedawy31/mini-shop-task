import { z } from "zod";
import { ORDER_STATUSES } from "../utils/order-status.js";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, "Order must contain at least one item"),
});

export const orderListQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
