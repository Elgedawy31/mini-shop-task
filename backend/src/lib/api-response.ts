import type { FastifyReply } from "fastify";

/** Error body — Mini Shop task contract */
export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string;
};

/** Success body */
export type ApiSuccessBody<T = unknown> = {
  success: true;
  message?: string;
  data?: T;
};

export function buildErrorBody(statusCode: number, error: string, message: string): ApiErrorBody {
  return { statusCode, error, message };
}

export function sendSuccess<T>(
  reply: FastifyReply,
  data?: T,
  options?: { message?: string; statusCode?: number }
): void {
  const body: ApiSuccessBody<T> = {
    success: true,
    ...(options?.message ? { message: options.message } : {}),
    ...(data !== undefined ? { data } : {}),
  };

  reply.status(options?.statusCode ?? 200).send(body);
}
