import { createClient } from "@supabase/supabase-js";
import { API_CONFIG } from "../config/api";

let realtimeClient: ReturnType<typeof createClient> | null | undefined;

export function getRealtimeClient() {
  if (realtimeClient !== undefined) {
    return realtimeClient;
  }

  if (!API_CONFIG.SUPABASE_URL || !API_CONFIG.SUPABASE_ANON_KEY) {
    realtimeClient = null;
    return realtimeClient;
  }

  realtimeClient = createClient(API_CONFIG.SUPABASE_URL, API_CONFIG.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return realtimeClient;
}
