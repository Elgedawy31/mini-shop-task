import type { FastifyInstance } from "fastify";
import { registerAuthPlugin } from "../plugins/auth.js";
import { authRoutes } from "./auth.js";
import { dashboardRoutes } from "./dashboard.js";
import { healthRoutes } from "./health.js";
import { orderRoutes } from "./orders.js";
import { productRoutes } from "./products.js";

export async function registerRoutes(app: FastifyInstance) {
  registerAuthPlugin(app);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(productRoutes);
  await app.register(orderRoutes);
  await app.register(dashboardRoutes);
}
