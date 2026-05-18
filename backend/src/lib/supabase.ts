import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export type DatabaseClient = SupabaseClient;

export function createAnonClient(): DatabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createUserClient(accessToken: string): DatabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}

export function createServiceClient(): DatabaseClient {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
