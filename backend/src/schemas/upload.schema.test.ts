import { describe, expect, test } from "bun:test";
import { MAX_IMAGE_BYTES, productImageFileSchema } from "./upload.schema.js";

describe("productImageFileSchema", () => {
  test("accepts valid image metadata", () => {
    const result = productImageFileSchema.safeParse({
      mimetype: "image/png",
      size: 1024,
      filename: "photo.png",
    });
    expect(result.success).toBe(true);
  });

  test("rejects unsupported mime type", () => {
    const result = productImageFileSchema.safeParse({
      mimetype: "application/pdf",
      size: 1024,
      filename: "doc.pdf",
    });
    expect(result.success).toBe(false);
  });

  test("rejects files over 1MB", () => {
    const result = productImageFileSchema.safeParse({
      mimetype: "image/jpeg",
      size: MAX_IMAGE_BYTES + 1,
      filename: "big.jpg",
    });
    expect(result.success).toBe(false);
  });
});
