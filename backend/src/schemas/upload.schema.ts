import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 1 * 1024 * 1024;

const allowedMimeSet = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);

export const productImageFileSchema = z.object({
  mimetype: z
    .string()
    .refine((value) => allowedMimeSet.has(value), "Only JPEG, PNG, and WebP images are allowed"),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_IMAGE_BYTES, { message: "Image must be 1MB or smaller" }),
  filename: z.string().min(1),
});

export type ProductImageFileInput = z.infer<typeof productImageFileSchema>;
