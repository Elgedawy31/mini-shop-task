import { describe, expect, test } from "bun:test";
import { createOrderSchema, updateOrderStatusSchema } from "./order.schema.js";

describe("order schemas", () => {
  test("createOrderSchema requires at least one item", () => {
    expect(createOrderSchema.safeParse({ items: [] }).success).toBe(false);
    expect(
      createOrderSchema.safeParse({
        items: [{ productId: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 }],
      }).success
    ).toBe(true);
  });

  test("createOrderSchema rejects invalid quantity", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: "550e8400-e29b-41d4-a716-446655440000", quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  test("updateOrderStatusSchema accepts valid statuses", () => {
    expect(updateOrderStatusSchema.safeParse({ status: "processing" }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });
});
