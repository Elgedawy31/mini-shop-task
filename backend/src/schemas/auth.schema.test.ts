import { describe, expect, test } from "bun:test";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  setupAdminSchema,
} from "./auth.schema.js";

describe("auth schemas", () => {
  test("registerSchema accepts valid payload", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  test("registerSchema rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  test("loginSchema requires email and password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
  });

  test("forgotPasswordSchema validates email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  test("refreshTokenSchema requires token", () => {
    expect(refreshTokenSchema.safeParse({ refreshToken: "abc" }).success).toBe(true);
    expect(refreshTokenSchema.safeParse({}).success).toBe(false);
  });

  test("setupAdminSchema matches register fields", () => {
    const result = setupAdminSchema.safeParse({
      name: "Admin",
      email: "admin@example.com",
      password: "Admin12345!",
    });
    expect(result.success).toBe(true);
  });
});
