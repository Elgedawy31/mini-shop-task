import { AppError } from "../errors/app-error.js";
import { createUserClient } from "../lib/supabase.js";
import type {
  CreateOrderInput,
  OrderListQuery,
  UpdateOrderStatusInput,
} from "../schemas/order.schema.js";
import type { OrderItemRow, OrderRow, OrderStatus } from "../types/domain.js";
import { assertStatusTransition } from "../utils/order-status.js";
import { parsePagination } from "../utils/pagination.js";

function mapOrder(row: OrderRow, items?: OrderItemRow[]) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items?.map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })),
  };
}

async function loadOrderItems(client: ReturnType<typeof createUserClient>, orderId: string) {
  const { data, error } = await client.from("order_items").select("*").eq("order_id", orderId);

  if (error) {
    throw new AppError({
      code: "order_items_fetch_failed",
      message: error.message,
      statusCode: 500,
    });
  }

  return (data ?? []) as OrderItemRow[];
}

export async function createOrder(accessToken: string, input: CreateOrderInput) {
  const client = createUserClient(accessToken);

  const payload = input.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  const { data, error } = await client.rpc("create_order_with_items", {
    p_items: payload,
  });

  if (error) {
    throw new AppError({
      code: "order_create_failed",
      message: error.message,
      statusCode: 400,
    });
  }

  const orderId = (data as { orderId: string }).orderId;
  return getOrderById(accessToken, orderId);
}

export async function listMyOrders(accessToken: string, query: OrderListQuery) {
  const { page, limit, offset } = parsePagination(query.page, query.limit);
  const client = createUserClient(accessToken);

  let dbQuery = client
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (query.status) {
    dbQuery = dbQuery.eq("status", query.status);
  }

  const { data, error, count } = await dbQuery;

  if (error) {
    throw new AppError({ code: "orders_list_failed", message: error.message, statusCode: 500 });
  }

  const orders = await Promise.all(
    ((data ?? []) as OrderRow[]).map(async (order) => {
      const items = await loadOrderItems(client, order.id);
      return mapOrder(order, items);
    })
  );

  return { items: orders, pagination: { page, limit, total: count ?? 0 } };
}

export async function listAllOrders(accessToken: string, query: OrderListQuery) {
  const { page, limit, offset } = parsePagination(query.page, query.limit);
  const client = createUserClient(accessToken);

  let dbQuery = client
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (query.status) {
    dbQuery = dbQuery.eq("status", query.status);
  }

  const { data, error, count } = await dbQuery;

  if (error) {
    throw new AppError({ code: "orders_list_failed", message: error.message, statusCode: 500 });
  }

  const orders = await Promise.all(
    ((data ?? []) as OrderRow[]).map(async (order) => {
      const items = await loadOrderItems(client, order.id);
      return mapOrder(order, items);
    })
  );

  return { items: orders, pagination: { page, limit, total: count ?? 0 } };
}

export async function getOrderById(accessToken: string, orderId: string) {
  const client = createUserClient(accessToken);

  const { data, error } = await client.from("orders").select("*").eq("id", orderId).single();

  if (error || !data) {
    throw new AppError({ code: "not_found", message: "Order not found", statusCode: 404 });
  }

  const items = await loadOrderItems(client, orderId);
  return mapOrder(data as OrderRow, items);
}

export async function updateOrderStatus(
  accessToken: string,
  orderId: string,
  input: UpdateOrderStatusInput
) {
  const client = createUserClient(accessToken);

  const { data: existing, error: fetchError } = await client
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !existing) {
    throw new AppError({ code: "not_found", message: "Order not found", statusCode: 404 });
  }

  assertStatusTransition(existing.status as OrderStatus, input.status);

  const { data, error } = await client
    .from("orders")
    .update({ status: input.status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    throw new AppError({
      code: "order_update_failed",
      message: error.message,
      statusCode: 400,
    });
  }

  const items = await loadOrderItems(client, orderId);
  return mapOrder(data as OrderRow, items);
}
