import type { FastifyInstance } from "fastify";
import { sendSuccess } from "../lib/api-response.js";
import * as categoriesService from "../services/categories.service.js";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/categories", async (_request, reply) => {
    const categories = await categoriesService.listCategories();
    sendSuccess(reply, { items: categories });
  });
}
