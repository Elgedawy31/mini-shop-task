import { z } from "zod";

export const productListQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  price: z.coerce.number().positive(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  imageUrl: z.string().url().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
