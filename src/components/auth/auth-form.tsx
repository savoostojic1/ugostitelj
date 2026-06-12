"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register" | "forgot";

const formCopy: Record<
  AuthMode,
  { title: string; subtitle: string; submit: string; loading: string }
> = {
  login: {
    title: "Sign in",
    subtitle: "Access your dashboard, calendars and booking site.",
    submit: "Sign in",
    loading: "Signing in…",
  },
  register: {
    title: "Create account",
    subtitle: "Start free — set up your properties and publish your site.",
    submit: "Create account",
    loading: "Creating account…",
  },
  forgot: {
    title: "Reset password",
    subtitle: "We will email you a link to choose a new password.",
    submit: "Send reset link",
    loading: "Sending…",
  },
};

function AuthField({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  trailing,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="auth-label">
        {label}
      </Label>
      <div className="relative">
        <Icon className="auth-field-icon" aria-hidden />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={cn("auth-input", trailing && "pr-11")}
        />
        {trailing}
      </div>
    </div>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const copy = formCopy[mode];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getBrowserClient();

      if (mode === "login") {
        const identifier = email.trim();
        if (!identifier.includes("@")) {
          const res = await fetch("/api/auth/team-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: identifier, password }),
          });
          const json = (await res.json()) as { error?: string };
          if (!res.ok) {
            throw new Error(json.error ?? "Invalid credentials");
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email: identifier,
            password,
          });
          if (error) throw error;
        }
        router.push("/dashboard");
        router.refresh();
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
        router.push("/login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {copy.title}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "register" ? (
          <AuthField
            id="name"
            label="Full name"
            icon={User}
            value={fullName}
            onChange={setFullName}
            required
            autoComplete="name"
          />
        ) : null}

        <AuthField
          id="email"
          label={mode === "login" ? "Email or username" : "Email"}
          icon={mode === "login" ? User : Mail}
          type={mode === "login" ? "text" : "email"}
          value={email}
          onChange={setEmail}
          required
          autoComplete={mode === "login" ? "username" : "email"}
        />

        {mode !== "forgot" ? (
          <AuthField
            id="password"
            label="Password"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
        ) : null}

        {mode === "register" ? (
          <p className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3 text-xs leading-relaxed text-zinc-400">
            Use at least 6 characters. After sign-up, confirm your email before
            signing in for the first time.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="hostvia-btn-gradient flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {copy.loading}
            </>
          ) : (
            <>
              {copy.submit}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="space-y-3 border-t border-white/8 pt-5 text-center text-sm">
        {mode === "login" ? (
          <>
            <p>
              <Link
                href="/forgot-password"
                className="font-medium text-violet-300 transition hover:text-violet-200"
              >
                Forgot password?
              </Link>
            </p>
            <p className="text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-white transition hover:text-violet-200"
              >
                Create one free
              </Link>
            </p>
          </>
        ) : null}

        {mode === "register" ? (
          <p className="text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-white transition hover:text-violet-200"
            >
              Sign in
            </Link>
          </p>
        ) : null}

        {mode === "forgot" ? (
          <p className="text-zinc-500">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-medium text-white transition hover:text-violet-200"
            >
              Back to sign in
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
