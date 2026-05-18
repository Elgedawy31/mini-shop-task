import type { FastifyInstance } from "fastify";
import { sendSuccess } from "../lib/api-response.js";
import { parseQuery } from "../lib/validate.js";
import { authenticate, requireRole } from "../plugins/auth.js";
import { dashboardRangeQuerySchema } from "../schemas/dashboard.schema.js";
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

  app.get(
    "/dashboard/overview",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const overview = await dashboardService.getDashboardOverview(request.accessToken!);
      sendSuccess(reply, overview);
    }
  );

  app.get(
    "/dashboard/revenue-series",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const query = parseQuery(dashboardRangeQuerySchema, request.query);
      const series = await dashboardService.getRevenueSeries(request.accessToken!, query.range);
      sendSuccess(reply, { range: query.range, points: series });
    }
  );

  app.get(
    "/dashboard/orders-series",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const query = parseQuery(dashboardRangeQuerySchema, request.query);
      const series = await dashboardService.getOrdersSeries(request.accessToken!, query.range);
      sendSuccess(reply, { range: query.range, points: series });
    }
  );
}
