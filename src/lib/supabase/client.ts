import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

function readBrowserCookies() {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf("=");
      const name = separator === -1 ? part : part.slice(0, separator);
      const value = separator === -1 ? "" : part.slice(separator + 1);
      return { name, value: decodeURIComponent(value) };
    });
}

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey, {
    cookies: {
      getAll() {
        return readBrowserCookies();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const segments = [
            `${name}=${encodeURIComponent(value)}`,
            `path=${options?.path ?? "/"}`,
          ];
          if (options?.maxAge != null) {
            segments.push(`max-age=${options.maxAge}`);
          }
          const sameSite = options?.sameSite ?? "lax";
          segments.push(`SameSite=${sameSite}`);
          if (options?.secure) {
            segments.push("Secure");
          }
          document.cookie = segments.join("; ");
        });
      },
    },
  });
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
