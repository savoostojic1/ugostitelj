import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let client: SupabaseClient | null = null;

/**
 * Anonymous client for public, read-only endpoints (guest prices, availability).
 * It never reads cookies or refreshes a session, so a guest request costs one
 * database round trip instead of waiting on auth first. Only use it for data the
 * anon role may read anyway.
 */
export function createAnonClient(): SupabaseClient {
  if (client) return client;
  const { url, anonKey } = getSupabaseEnv();
  client = createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
