import type { FastifyInstance } from "fastify";
import { sendSuccess } from "../lib/api-response.js";
import { authenticate, requireRole } from "../plugins/auth.js";
import * as dashboardService from "../services/dashboard.service.js";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    "/dashboard/stats",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const stats = await dashboardService.getDashboardStats(request.accessToken!);
      sendSuccess(reply, stats);
    }
  );
}
