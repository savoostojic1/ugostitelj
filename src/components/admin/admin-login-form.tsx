"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const adminFetch = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, { ...init, credentials: "include" });

async function redirectToDashboard() {
  const sessionRes = await adminFetch("/api/admin/session");
  const sessionData = await sessionRes.json();

  if (!sessionData.authenticated) {
    throw new Error("Session was not saved. Try again or use the same URL (www vs non-www).");
  }

  window.location.assign("/admin/dashboard");
}

export function AdminLoginForm({
  setupRequiredInitially = false,
}: {
  setupRequiredInitially?: boolean;
}) {
  const [username, setUsername] = useState("admin-savo");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [setupRequired, setSetupRequired] = useState(setupRequiredInitially);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await adminFetch("/api/admin/setup");
        const data = await res.json();
        if (data.username) setUsername(data.username);
        const needsSetup = Boolean(data.setupRequired);
        setSetupRequired(needsSetup);

        if (needsSetup) {
          await adminFetch("/api/admin/logout", { method: "POST" });
        }
      } catch {
        toast.error("Could not load admin status");
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Setup failed");

      toast.success("Admin password saved. Signing you in…");

      const loginRes = await adminFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error ?? "Login failed");

      await redirectToDashboard();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Setup failed";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await adminFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Invalid username or password");
      }

      await redirectToDashboard();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid username or password";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/60">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="hostvia-admin-card w-full max-w-md p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Hostvia Admin</h1>
            <p className="text-sm text-white/55">
              {setupRequired
                ? "Choose your admin password (one time only)"
                : "Sign in to manage accounts"}
            </p>
          </div>
        </div>

        <form
          onSubmit={setupRequired ? handleSetup : handleLogin}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="admin-username" className="text-sm text-white/70">
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                id="admin-username"
                className="hostvia-admin-input pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                readOnly={setupRequired}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-sm text-white/70">
              {setupRequired ? "New password" : "Password"}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                id="admin-password"
                type="password"
                className="hostvia-admin-input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={setupRequired ? "new-password" : "current-password"}
                required
                minLength={setupRequired ? 8 : undefined}
              />
            </div>
          </div>

          {setupRequired && (
            <div className="space-y-2">
              <label
                htmlFor="admin-password-confirm"
                className="text-sm text-white/70"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  id="admin-password-confirm"
                  type="password"
                  className="hostvia-admin-input pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            className="mt-2 h-11 w-full bg-sky-500 text-white hover:bg-sky-400"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                {setupRequired ? "Saving…" : "Signing in…"}
              </>
            ) : setupRequired ? (
              "Create admin password"
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {setupRequired && (
          <p className="mt-4 text-xs leading-relaxed text-white/45">
            No Vercel env vars needed. This password is stored securely in
            Supabase and is separate from CRON_SECRET.
          </p>
        )}
      </div>
    </div>
  );
}
