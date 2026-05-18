import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { registerRoutes } from "./routes/index.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "test" ? "silent" : "info",
    },
    requestIdHeader: "x-request-id",
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: env.corsOrigin,
    credentials: true,
  });

  registerErrorHandler(app);
  await registerRoutes(app);

  return app;
}
