import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/app-error.js";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
};

export function registerErrorHandler(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        code: "route_not_found",
        message: `Route ${request.method} ${request.url} was not found`,
        requestId: request.id,
      },
    } satisfies ErrorResponse);
  });

  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    const normalized = normalizeError(error);

    request.log.error(
      {
        err: error,
        requestId: request.id,
        statusCode: normalized.statusCode,
        code: normalized.code,
      },
      "Request failed"
    );

    sendError(reply, request, normalized);
  });
}

function normalizeError(error: FastifyError | AppError): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if ("validation" in error && error.validation) {
    return new AppError({
      code: "validation_error",
      message: "Request validation failed",
      statusCode: 400,
      details: error.validation,
      cause: error,
    });
  }

  return new AppError({
    code: "internal_server_error",
    message: "Something went wrong",
    statusCode: error.statusCode && error.statusCode >= 400 ? error.statusCode : 500,
    cause: error,
  });
}

function sendError(reply: FastifyReply, request: FastifyRequest, error: AppError) {
  const body: ErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
      requestId: request.id,
      ...(error.details ? { details: error.details } : {}),
    },
  };

  reply.status(error.statusCode).send(body);
}
