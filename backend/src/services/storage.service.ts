import { randomUUID } from "node:crypto";
import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";
import { createUserClient } from "../lib/supabase.js";
import { productImageFileSchema } from "../schemas/upload.schema.js";
import { parseBody } from "../lib/validate.js";

export async function uploadProductImage(
  accessToken: string,
  file: { buffer: Buffer; mimetype: string; filename: string }
): Promise<string> {
  parseBody(productImageFileSchema, {
    mimetype: file.mimetype,
    size: file.buffer.length,
    filename: file.filename,
  });

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
