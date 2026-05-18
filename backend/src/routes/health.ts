import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    success: true,
    data: {
      status: "ok",
      service: "mini-shop-backend",
      timestamp: new Date().toISOString(),
    },
  }));
}
