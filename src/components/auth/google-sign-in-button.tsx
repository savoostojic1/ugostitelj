"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/client";
import { trackHostviaEvent } from "@/lib/analytics/track";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="h-5 w-5">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.3 5.3C36.9 41.6 44 36 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

function googleErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Could not start Google sign-in";
  if (/provider is not enabled|unsupported provider/i.test(message)) {
    return "Google sign-in is not turned on for this site yet.";
  }
  return message;
}

export function GoogleSignInButton({
  mode,
}: {
  mode: "login" | "register";
}) {
  const [loading, setLoading] = useState(false);
  const label = mode === "register" ? "Sign up with Google" : "Continue with Google";

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
      trackHostviaEvent(mode === "register" ? "sign_up" : "login", {
        method: "google",
      });
    } catch (error) {
      toast.error(googleErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void signInWithGoogle()}
      disabled={loading}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-zinc-500" /> : <GoogleMark />}
      {loading ? "Opening Google…" : label}
    </button>
  );
}
