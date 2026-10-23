"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createPkceCallbackClient } from "@/lib/supabase/client";

function loginUrl(reason: string, detail?: string) {
  const url = new URL("/login", window.location.origin);
  url.searchParams.set("error", "auth-callback");
  url.searchParams.set("reason", reason);
  if (detail) url.searchParams.set("detail", detail);
  return url.toString();
}

function safeDetail(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim().slice(0, 180);
  if (!cleaned || /[<>]/.test(cleaned)) return "";
  return cleaned;
}

function reasonFromMessage(message: string) {
  const text = message.toLowerCase();
  if (text.includes("already")) return "exists";
  if (
    text.includes("access_denied") ||
    text.includes("cancel") ||
    text.includes("denied")
  ) {
    return "cancelled";
  }
  return "failed";
}

const exchanges = new Map<string, Promise<void>>();

function exchangeCode(code: string) {
  const existing = exchanges.get(code);
  if (existing) return existing;

  const pending = (async () => {
    const supabase = createPkceCallbackClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  })();
  exchanges.set(code, pending);
  return pending;
}

export function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const providerError = params.get("error_description") || params.get("error") || "";

    if (!code) {
      window.location.replace(
        loginUrl(reasonFromMessage(providerError || "failed"), safeDetail(providerError))
      );
      return;
    }

    exchangeCode(code)
      .then(() => {
        window.location.replace("/dashboard");
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Google sign-in failed";
        console.error("[auth/callback]", message);
        window.location.replace(loginUrl(reasonFromMessage(message), safeDetail(message)));
      });
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      Signing you in…
    </div>
  );
}
