import { describe, expect, test } from "bun:test";
import { AppError } from "../errors/app-error.js";
import { assertStatusTransition, canTransition } from "./order-status.js";

describe("order status transitions", () => {
  test("allows pending → processing", () => {
    expect(canTransition("pending", "processing")).toBe(true);
  });

  test("allows processing → shipped", () => {
    expect(canTransition("processing", "shipped")).toBe(true);
  });

  test("blocks pending → shipped", () => {
    expect(canTransition("pending", "shipped")).toBe(false);
  });

  test("blocks changes after delivered", () => {
    expect(canTransition("delivered", "pending")).toBe(false);
  });

  test("assertStatusTransition throws AppError on invalid move", () => {
    expect(() => assertStatusTransition("pending", "delivered")).toThrow(AppError);
  });

  test("same status is always allowed", () => {
    expect(canTransition("processing", "processing")).toBe(true);
  });
});
