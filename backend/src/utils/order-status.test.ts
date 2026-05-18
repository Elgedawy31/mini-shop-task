import { describe, expect, it } from "bun:test";
import { canTransition } from "./order-status.js";

describe("order status transitions", () => {
  it("allows pending to processing", () => {
    expect(canTransition("pending", "processing")).toBe(true);
  });

  it("allows pending to cancelled", () => {
    expect(canTransition("pending", "cancelled")).toBe(true);
  });

  it("denies pending to delivered", () => {
    expect(canTransition("pending", "delivered")).toBe(false);
  });

  it("denies delivered to processing", () => {
    expect(canTransition("delivered", "processing")).toBe(false);
  });

  it("allows same status", () => {
    expect(canTransition("shipped", "shipped")).toBe(true);
  });
});
