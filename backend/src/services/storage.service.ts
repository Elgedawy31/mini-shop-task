import { randomUUID } from "node:crypto";
import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";
import { createUserClient } from "../lib/supabase.js";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 1 * 1024 * 1024;

export async function uploadProductImage(
  accessToken: string,
  file: { buffer: Buffer; mimetype: string; filename: string }
): Promise<string> {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw new AppError({
      code: "invalid_file_type",
      message: "Only JPEG, PNG, and WebP images are allowed",
      statusCode: 400,
    });
  }

  if (file.buffer.length > MAX_BYTES) {
    throw new AppError({
      code: "file_too_large",
      message: "Image must be 1MB or smaller",
      statusCode: 400,
    });
  }

  const ext = file.filename.split(".").pop() ?? "jpg";
  const path = `${randomUUID()}.${ext}`;
  const supabase = createUserClient(accessToken);

  const { error } = await supabase.storage.from(env.storageBucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw new AppError({
      code: "upload_failed",
      message: error.message,
      statusCode: 400,
    });
  }

  const { data } = supabase.storage.from(env.storageBucket).getPublicUrl(path);
  return data.publicUrl;
}
