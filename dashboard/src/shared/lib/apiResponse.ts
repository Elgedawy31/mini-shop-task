import type { ApiClientError, ApiErrorBody, ApiResponse } from "../types/api";

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!value || typeof value !== "object") return false;
  const body = value as ApiErrorBody;
  return (
    typeof body.statusCode === "number" &&
    typeof body.error === "string" &&
    typeof body.message === "string"
  );
}

export function parseErrorBody(data: unknown): ApiClientError | null {
  if (!data || typeof data !== "object") return null;

  if (isApiErrorBody(data)) {
    return {
      message: data.message,
      status: data.statusCode,
      error: data.error,
    };
  }

  const legacy = data as Record<string, unknown>;

  if (legacy.error && typeof legacy.error === "object") {
    const nested = legacy.error as { code?: string; message?: string };
    return {
      message: nested.message ?? "Request failed",
      status: typeof legacy.statusCode === "number" ? legacy.statusCode : undefined,
      error: nested.code,
    };
  }

  if (typeof legacy.message === "string") {
    return {
      message: legacy.message,
      status: typeof legacy.statusCode === "number" ? legacy.statusCode : undefined,
      error: typeof legacy.error === "string" ? legacy.error : undefined,
      errors: Array.isArray(legacy.errors) ? (legacy.errors as string[]) : undefined,
    };
  }

  if (typeof legacy.error === "string") {
    return {
      message: legacy.error,
      status: typeof legacy.statusCode === "number" ? legacy.statusCode : undefined,
      error: legacy.error,
    };
  }

  return null;
}

export function toFailureResponse<T>(error: ApiClientError): ApiResponse<T> {
  return {
    success: false,
    message: error.message,
    error: error.error ?? error.message,
    errors: error.errors,
    statusCode: error.status,
  };
}

/** Unwrap success envelope or auth payload at the top level */
export function unwrapResponse<T extends Record<string, unknown>>(
  raw: ApiResponse<T> & Record<string, unknown>
): ApiResponse<T> & Record<string, unknown> {
  if (raw.success === false) {
    return {
      success: false,
      message: raw.message,
      error: raw.error ?? raw.message,
      errors: raw.errors,
      statusCode: raw.statusCode,
    };
  }

  const data = raw.data as T | undefined;
  const merged = data
    ? { ...raw, ...data, success: true as const }
    : { ...raw, success: true as const };

  return merged;
}
