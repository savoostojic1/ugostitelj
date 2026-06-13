"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Crown, Loader2 } from "lucide-react";
import type { AdminHostRow } from "@/app/api/admin/hosts/route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRO_LAUNCH_PRICE_EUR } from "@/lib/subscriptions/plans";
import { toast } from "sonner";

type AdminPricingDialogProps = {
  host: AdminHostRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

function planBadgeClass(host: AdminHostRow): string {
  if (host.pro_access_granted) {
    return "border-emerald-500/30 bg-emerald-500/15 text-emerald-200";
  }
  if (host.is_pro) {
    return "border-sky-500/30 bg-sky-500/15 text-sky-200";
  }
  return "border-white/15 text-white/70";
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/6 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-white/45">
        {label}
      </span>
      <span
        className={`text-sm text-white/90 sm:max-w-[60%] sm:text-right ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export function AdminPricingDialog({
  host,
  open,
  onOpenChange,
  onUpdated,
}: AdminPricingDialogProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!host) return null;

  async function updateComplimentary(granted: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pro-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: host!.id,
          granted,
          note: granted ? note.trim() || "Admin grant" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      toast.success(data.message ?? "Plan updated");
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const stripeActive =
    host.plan_source === "stripe" &&
    (host.subscription_status === "active" ||
      host.subscription_status === "past_due");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg border-white/10 bg-[#0c0c12] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Crown className="h-5 w-5 text-sky-300" />
            Pricing — {host.username ? `@${host.username}` : host.email}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/45">
                  Current plan
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {host.plan_label}
                </p>
              </div>
              <Badge variant="outline" className={planBadgeClass(host)}>
                {host.plan_source}
              </Badge>
            </div>

            <p className="mt-3 text-sm text-white/55">
              {host.is_pro
                ? "Unlimited properties and full access."
                : `Free tier — up to ${host.free_limit} properties.`}
              {!host.is_pro && (
                <span className="text-white/40">
                  {" "}
                  Pro via Stripe is {PRO_LAUNCH_PRICE_EUR}€/month when they
                  upgrade.
                </span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-1">
            <DetailRow
              label="Properties"
              value={
                <>
                  {host.property_count}
                  <span className="text-white/45">
                    {" "}
                    / {host.is_pro ? "∞" : host.free_limit}
                  </span>
                  {host.requires_upgrade && (
                    <span className="ml-2 text-amber-400">· upgrade needed</span>
                  )}
                </>
              }
            />
            <DetailRow label="Stripe status" value={host.subscription_status} />
            <DetailRow
              label="Period ends"
              value={
                host.subscription_current_period_end
                  ? format(
                      new Date(host.subscription_current_period_end),
                      "dd MMM yyyy HH:mm"
                    )
                  : "—"
              }
            />
            <DetailRow
              label="Stripe customer"
              value={host.stripe_customer_id ?? "—"}
              mono
            />
            <DetailRow
              label="Stripe subscription"
              value={host.stripe_subscription_id ?? "—"}
              mono
            />
            {host.pro_access_granted && (
              <>
                <DetailRow
                  label="Complimentary since"
                  value={
                    host.pro_access_granted_at
                      ? format(
                          new Date(host.pro_access_granted_at),
                          "dd MMM yyyy"
                        )
                      : "—"
                  }
                />
                <DetailRow
                  label="Admin note"
                  value={host.pro_access_granted_note ?? "—"}
                />
              </>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-sm font-medium text-white">Admin activation</p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              Grant complimentary Pro without Stripe — unlimited properties, no
              billing. User keeps Stripe subscription separately if they have
              one.
            </p>

            {!host.pro_access_granted && (
              <div className="mt-3 space-y-2">
                <label
                  htmlFor="admin-pricing-note"
                  className="text-xs text-white/55"
                >
                  Note (optional)
                </label>
                <input
                  id="admin-pricing-note"
                  className="hostvia-admin-input"
                  placeholder="Partner, beta tester…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {!host.pro_access_granted ? (
                <Button
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
                  disabled={saving}
                  onClick={() => void updateComplimentary(true)}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Activate complimentary Pro"
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/5"
                  disabled={saving}
                  onClick={() => void updateComplimentary(false)}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Revoke complimentary Pro"
                  )}
                </Button>
              )}
            </div>

            {stripeActive && (
              <p className="mt-3 text-xs text-amber-200/80">
                Stripe subscription is active — cancel or manage in Stripe
                dashboard if needed.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
