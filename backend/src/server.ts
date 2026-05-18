import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = await buildApp();

const shutdown = async (signal: NodeJS.Signals) => {
  app.log.info({ signal }, "Shutting down server");
  await app.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

try {
  await app.listen({ host: env.host, port: env.port });
} catch (error) {
  app.log.error(error, "Failed to start server");
  process.exit(1);
}
