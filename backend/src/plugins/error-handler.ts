import type { FastifyError, FastifyInstance, FastifyReply } from "fastify";
import { AppError } from "../errors/app-error.js";
import { buildErrorBody } from "../lib/api-response.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    reply
      .status(404)
      .send(
        buildErrorBody(404, "not_found", `Route ${request.method} ${request.url} was not found`)
      );
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

    sendError(reply, normalized);
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

function sendError(reply: FastifyReply, error: AppError) {
  reply.status(error.statusCode).send(buildErrorBody(error.statusCode, error.code, error.message));
}
