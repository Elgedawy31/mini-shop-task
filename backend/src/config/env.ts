import { z } from "zod";

const DEFAULT_PORT = 5001;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(DEFAULT_PORT),
  /** Comma-separated allowed origins (dashboard, Expo web, etc.) */
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5000,http://localhost:8081,http://127.0.0.1:8081"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().default("product-images"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(
      `Invalid environment configuration (${missing}). Copy backend/.env.example to backend/.env and set Supabase credentials.`
    );
  }

  return parsed.data;
}

function parseCorsOrigins(raw: string): string[] {
  const origins = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  for (const origin of origins) {
    try {
      new URL(origin);
    } catch {
      throw new Error(`Invalid CORS_ORIGIN entry: "${origin}"`);
    }
  }

  return origins.length > 0 ? origins : ["http://localhost:5000"];
}

const config = loadEnv();

export const env = {
  nodeEnv: config.NODE_ENV,
  host: config.HOST,
  port: config.PORT,
  corsOrigins: parseCorsOrigins(config.CORS_ORIGIN),
  supabaseUrl: config.SUPABASE_URL,
  supabaseAnonKey: config.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
  storageBucket: config.STORAGE_BUCKET,
  isProduction: config.NODE_ENV === "production",
};
