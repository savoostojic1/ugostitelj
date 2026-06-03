"use client";

import { useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";

const noopSubscribe = () => () => {};

/**
 * Browser-only Supabase client. Avoids creating the client during SSR/prerender
 * (fixes Vercel build when auth pages are statically analyzed).
 */
export function useSupabase(): SupabaseClient {
  return useSyncExternalStore(
    noopSubscribe,
    getBrowserClient,
    () => null as unknown as SupabaseClient
  );
}
