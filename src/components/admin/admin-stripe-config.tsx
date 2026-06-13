"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type StripeConfigStatus = {
  configured: boolean;
  source: "env" | "supabase" | "mixed" | null;
  envConfigured: boolean;
  supabaseConfigured: boolean;
  secretKey: string | null;
  webhookSecret: string | null;
  priceId: string | null;
  updatedAt: string | null;
  webhookUrl: string;
};

export function AdminStripeConfig() {
  const [status, setStatus] = useState<StripeConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [priceId, setPriceId] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stripe-config");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load Stripe config");
      setStatus(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load Stripe config"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!secretKey.trim() && !webhookSecret.trim() && !priceId.trim()) {
      toast.error("Enter at least one value to save.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (secretKey.trim()) payload.secretKey = secretKey.trim();
      if (webhookSecret.trim()) payload.webhookSecret = webhookSecret.trim();
      if (priceId.trim()) payload.priceId = priceId.trim();

      const res = await fetch("/api/admin/stripe-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");

      toast.success(data.message ?? "Stripe configuration saved");
      setSecretKey("");
      setWebhookSecret("");
      setPriceId("");
      await loadStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function copyWebhookUrl() {
    if (!status?.webhookUrl) return;
    await navigator.clipboard.writeText(status.webhookUrl);
    toast.success("Webhook URL copied");
  }

  return (
    <div className="hostvia-admin-card mb-8 p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Stripe payments</h2>
            <p className="mt-1 text-sm text-white/55">
              Store keys in Supabase instead of Vercel env. Leave a field empty
              to keep the current value.
            </p>
          </div>
        </div>
        {status?.configured ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Checkout ready
          </div>
        ) : (
          <div className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
            Not configured
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-white/55">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading Stripe config…
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-3 text-sm sm:grid-cols-3">
            <StatusPill
              label="Supabase"
              active={Boolean(status?.supabaseConfigured)}
              detail={status?.secretKey ? `Key ${status.secretKey}` : "No keys"}
            />
            <StatusPill
              label="Vercel env"
              active={Boolean(status?.envConfigured)}
              detail={
                status?.envConfigured
                  ? "Env vars still override empty fields"
                  : "Not set"
              }
            />
            <StatusPill
              label="Price ID"
              active={Boolean(status?.priceId)}
              detail={status?.priceId ?? "Missing"}
            />
          </div>

          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            <Field
              label="Secret key"
              hint={
                status?.secretKey
                  ? `Current: ${status.secretKey}`
                  : "sk_test_… or sk_live_…"
              }
              value={secretKey}
              onChange={setSecretKey}
              placeholder="sk_live_…"
            />
            <Field
              label="Webhook secret"
              hint={
                status?.webhookSecret
                  ? `Current: ${status.webhookSecret}`
                  : "whsec_…"
              }
              value={webhookSecret}
              onChange={setWebhookSecret}
              placeholder="whsec_…"
            />
            <Field
              label="Price ID"
              hint={status?.priceId ? `Current: ${status.priceId}` : "price_…"}
              value={priceId}
              onChange={setPriceId}
              placeholder="price_…"
              type="text"
            />

            <div className="rounded-lg border border-white/8 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
                Stripe webhook URL
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 break-all text-sm text-sky-300">
                  {status?.webhookUrl}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/15 bg-transparent text-white hover:bg-white/5"
                  onClick={() => void copyWebhookUrl()}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <p className="mt-2 text-xs text-white/45">
                Add this endpoint in Stripe Dashboard → Developers → Webhooks.
                Events: checkout.session.completed, customer.subscription.*,
                invoice.payment_failed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={saving}
                className="bg-violet-600 text-white hover:bg-violet-500"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Stripe keys
                  </>
                )}
              </Button>
              {status?.updatedAt ? (
                <p className="text-xs text-white/40">
                  Last saved{" "}
                  {new Date(status.updatedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              ) : null}
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function StatusPill({
  label,
  active,
  detail,
}: {
  label: string;
  active: boolean;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${
          active ? "text-emerald-300" : "text-white/55"
        }`}
      >
        {active ? "Set" : "Missing"}
      </p>
      <p className="mt-0.5 truncate text-xs text-white/40">{detail}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "password",
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "password";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/80">
        {label}
      </span>
      <input
        type={type}
        className="hostvia-admin-input font-mono text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      <span className="mt-1 block text-xs text-white/40">{hint}</span>
    </label>
  );
}
