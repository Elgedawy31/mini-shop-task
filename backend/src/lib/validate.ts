import type { z } from "zod";
import { AppError } from "../errors/app-error.js";

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new AppError({
      code: "validation_error",
      message: "Request validation failed",
      statusCode: 400,
      details: result.error.flatten(),
    });
  }

  return result.data;
}

export function parseQuery<T>(schema: z.ZodType<T>, query: unknown): T {
  return parseBody(schema, query);
}
