import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readBrowserCookies() {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf("=");
      const name = separator === -1 ? part : part.slice(0, separator);
      const value = separator === -1 ? "" : part.slice(separator + 1);
      return { name, value: decodeCookieValue(value) };
    });
}

const browserCookies = {
  getAll() {
    return readBrowserCookies();
  },
  setAll(
    cookiesToSet: {
      name: string;
      value: string;
      options?: { path?: string; maxAge?: number; sameSite?: string | boolean; secure?: boolean };
    }[]
  ) {
    cookiesToSet.forEach(({ name, value, options }) => {
      const segments = [
        `${name}=${encodeURIComponent(value)}`,
        `path=${options?.path ?? "/"}`,
      ];
      if (options?.maxAge != null) {
        segments.push(`max-age=${options.maxAge}`);
      }
      const sameSite =
        typeof options?.sameSite === "string" ? options.sameSite : "lax";
      segments.push(`SameSite=${sameSite}`);
      const secure =
        options?.secure ?? window.location.protocol === "https:";
      if (secure) {
        segments.push("Secure");
      }
      document.cookie = segments.join("; ");
    });
  },
};

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey, {
    cookies: browserCookies,
  });
}

/** Exchanges an OAuth code in the browser, where the PKCE verifier cookie lives. */
export function createPkceCallbackClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey, {
    isSingleton: false,
    cookies: browserCookies,
    auth: {
      detectSessionInUrl: false,
      flowType: "pkce",
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
