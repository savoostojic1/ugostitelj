"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Copy, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CreemStatus = {
  checkoutReady: boolean;
  apiKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
  productId: string | null;
  mode: "test" | "live" | "unknown";
  webhookUrl: string;
};

export function AdminCreemStatus() {
  const [status, setStatus] = useState<CreemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/creem-status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load Creem status");
      setStatus(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load Creem status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

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
            <h2 className="text-lg font-semibold text-white">Creem billing</h2>
            <p className="mt-1 text-sm text-white/55">
              Checkout, the customer portal, and subscription status use Creem.
              Keys stay in the server environment and are not shown here.
            </p>
          </div>
        </div>
        {status?.checkoutReady ? (
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
        <div className="flex items-center gap-2 py-6 text-white/55">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading Creem status…
        </div>
      ) : (
        <>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <StatusPill
              label="API key"
              active={Boolean(status?.apiKeyConfigured)}
              detail={status?.apiKeyConfigured ? "Set" : "Missing"}
            />
            <StatusPill
              label="Webhook secret"
              active={Boolean(status?.webhookSecretConfigured)}
              detail={status?.webhookSecretConfigured ? "Set" : "Missing"}
            />
            <StatusPill
              label="Product"
              active={Boolean(status?.productId)}
              detail={status?.productId ?? "Missing"}
            />
            <StatusPill
              label="Mode"
              active={status?.mode === "live" || status?.mode === "test"}
              detail={
                status?.mode === "live"
                  ? "Live"
                  : status?.mode === "test"
                    ? "Test"
                    : "Unknown"
              }
            />
          </div>

          <div className="mt-5 rounded-lg border border-white/8 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
              Creem webhook URL
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
          </div>
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
      <p className={`mt-1 truncate text-sm font-medium ${active ? "text-emerald-300" : "text-white/55"}`}>
        {detail}
      </p>
    </div>
  );
}
