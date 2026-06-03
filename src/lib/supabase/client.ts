import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

let browserClient: SupabaseClient | undefined;

export function getBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("Supabase browser client is only available in the browser.");
  }
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
