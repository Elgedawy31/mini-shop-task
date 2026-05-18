import type { FastifyInstance } from "fastify";
import { sendSuccess } from "../lib/api-response.js";
import { parseBody, parseQuery } from "../lib/validate.js";
import { authenticate, requireRole } from "../plugins/auth.js";
import {
  createOrderSchema,
  orderIdParamSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
} from "../schemas/order.schema.js";
import * as ordersService from "../services/orders.service.js";

export async function orderRoutes(app: FastifyInstance) {
  app.post(
    "/orders",
    { preHandler: [authenticate, requireRole("customer", "admin")] },
    async (request, reply) => {
      const body = parseBody(createOrderSchema, request.body);
      const order = await ordersService.createOrder(request.accessToken!, body);
      sendSuccess(reply, order, { statusCode: 201, message: "Order placed" });
    }
  );

  app.get(
    "/orders/my",
    { preHandler: [authenticate, requireRole("customer", "admin")] },
    async (request, reply) => {
      const query = parseQuery(orderListQuerySchema, request.query);
      const result = await ordersService.listMyOrders(request.accessToken!, query);
      sendSuccess(reply, result);
    }
  );

  app.get(
    "/orders",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const query = parseQuery(orderListQuerySchema, request.query);
      const result = await ordersService.listAllOrders(request.accessToken!, query);
      sendSuccess(reply, result);
    }
  );

  app.patch(
    "/orders/:id/status",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const { id } = parseBody(orderIdParamSchema, request.params);
      const body = parseBody(updateOrderStatusSchema, request.body);
      const order = await ordersService.updateOrderStatus(request.accessToken!, id, body);
      sendSuccess(reply, order, { message: "Order status updated" });
    }
  );
}
