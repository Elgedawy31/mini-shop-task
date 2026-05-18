import type { FastifyInstance } from "fastify";
import { sendSuccess } from "../lib/api-response.js";
import { parseBody, parseQuery } from "../lib/validate.js";
import { authenticate, requireRole } from "../plugins/auth.js";
import {
  createProductSchema,
  productIdParamSchema,
  productListQuerySchema,
  updateProductSchema,
} from "../schemas/product.schema.js";
import * as productsService from "../services/products.service.js";
import { uploadProductImage } from "../services/storage.service.js";

function optionalToken(request: { headers: { authorization?: string } }): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice(7).trim() || undefined;
}

export async function productRoutes(app: FastifyInstance) {
  app.get("/products", async (request, reply) => {
    const query = parseQuery(productListQuerySchema, request.query);
    const token = optionalToken(request);
    const result = await productsService.listProducts(query, token);
    sendSuccess(reply, result);
  });

  app.get("/products/:id", async (request, reply) => {
    const { id } = parseBody(productIdParamSchema, request.params);
    const token = optionalToken(request);
    const product = await productsService.getProductById(id, token);
    sendSuccess(reply, product);
  });

  app.post(
    "/products",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const body = parseBody(createProductSchema, request.body);
      const product = await productsService.createProduct(request.accessToken!, body);
      sendSuccess(reply, product, { statusCode: 201, message: "Product created" });
    }
  );

  app.post(
    "/products/upload-image",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const file = await request.file();
      if (!file) {
        reply.status(400).send({
          statusCode: 400,
          error: "validation_error",
          message: "Image file is required",
        });
        return;
      }

      const buffer = await file.toBuffer();
      const imageUrl = await uploadProductImage(request.accessToken!, {
        buffer,
        mimetype: file.mimetype,
        filename: file.filename,
      });

      sendSuccess(reply, { imageUrl }, { statusCode: 201 });
    }
  );

  app.patch(
    "/products/:id",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const { id } = parseBody(productIdParamSchema, request.params);
      const body = parseBody(updateProductSchema, request.body);
      const product = await productsService.updateProduct(request.accessToken!, id, body);
      sendSuccess(reply, product, { message: "Product updated" });
    }
  );

  app.delete(
    "/products/:id",
    { preHandler: [authenticate, requireRole("admin")] },
    async (request, reply) => {
      const { id } = parseBody(productIdParamSchema, request.params);
      const result = await productsService.deleteProduct(request.accessToken!, id);
      sendSuccess(reply, result, { message: "Product deleted" });
    }
  );
}
