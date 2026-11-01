"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserClient } from "@/lib/supabase/client";
import { trackHostviaEvent } from "@/lib/analytics/track";
import { clearLocalDraft } from "@/lib/guest-guide/local-draft";
import {
  ensureServerDraft,
  publishGuestGuideDraft,
} from "@/lib/guest-guide/publish-draft";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function clearLocalDraftSafe() {
  try {
    clearLocalDraft();
  } catch {
    // Ignore.
  }
}

export function PublishGate({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    void ensureServerDraft();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  async function finishAfterAuth() {
    trackHostviaEvent("guest_guide_registration_complete", { method: mode });
    const guide = await publishGuestGuideDraft();
    trackHostviaEvent("guest_guide_publish", { slug: guide.slug });
    toast.success("Your guest guide is published");
    clearLocalDraftSafe();
    router.push(`/dashboard/guest-guides?published=${guide.id}`);
    router.refresh();
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const supabase = getBrowserClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      } else {
        trackHostviaEvent("guest_guide_registration_start", { method: "email" });
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm, then sign in to publish.");
          setMode("login");
          return;
        }
        trackHostviaEvent("sign_up", { method: "email" });
      }
      await finishAfterAuth();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-black/70 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-gate-title"
    >
      <div
        className="mx-auto flex min-h-[calc(100dvh-1.5rem)] items-end justify-center py-3 sm:items-center"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
      <div className="auth-form-card relative w-full max-w-md bg-[#0c0c12] p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-emerald-300">
          100% Free. No subscription. No credit card.
        </p>
        <h2
          id="publish-gate-title"
          className="mt-3 text-2xl font-bold tracking-tight text-white"
        >
          Your Guest Guide Is Ready!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Create your free Hostvia account to publish your guide, get your
          personal sharing link and edit it whenever you need.
        </p>

        <div className="mt-6 flex gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(["register", "login"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-wide",
                mode === item
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {item === "register" ? "Create account" : "Log in"}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <GoogleSignInButton
            mode={mode}
            next="/dashboard/guest-guides?claim=1"
            onBeforeSignIn={() => ensureServerDraft()}
          />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <span className="h-px flex-1 bg-white/10" />
          or
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="gg-name" className="auth-label">
                Full name
              </Label>
              <div className="relative">
                <User className="auth-field-icon" aria-hidden />
                <Input
                  id="gg-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="auth-input"
                  autoComplete="name"
                />
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="gg-email" className="auth-label">
              Email
            </Label>
            <div className="relative">
              <Mail className="auth-field-icon" aria-hidden />
              <Input
                id="gg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                autoComplete="email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gg-password" className="auth-label">
              Password
            </Label>
            <div className="relative">
              <Lock className="auth-field-icon" aria-hidden />
              <Input
                id="gg-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input pr-11"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="hostvia-btn-gradient flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                {mode === "register" ? "Create account & publish" : "Sign in & publish"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Prefer the main signup page?{" "}
          <Link
            href="/register?next=/dashboard/guest-guides?claim=1"
            className="text-violet-300 hover:text-violet-200"
            onClick={() =>
              trackHostviaEvent("guest_guide_registration_start", {
                method: "register_page",
              })
            }
          >
            Continue there
          </Link>
          . Your draft is saved.
        </p>
      </div>
      </div>
    </div>
  );
}
