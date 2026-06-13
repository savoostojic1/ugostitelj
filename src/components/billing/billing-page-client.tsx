"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  AlertCircle,
  Building2,
  Check,
  Crown,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useBillingPortal,
  useBillingStatus,
  useSyncBilling,
  useStartCheckout,
} from "@/hooks/use-billing";
import {
  FREE_PROPERTY_LIMIT,
  PRO_LAUNCH_PRICE_EUR,
  PRO_REGULAR_PRICE_EUR,
} from "@/lib/subscriptions/plans";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const freeFeatures = [
  "Up to 2 properties",
  "Direct booking website",
  "Calendar sync",
  "Reservations & dashboard",
  "Airbnb & Booking imports",
];

const proFeatures = [
  "Unlimited properties",
  "Everything in Free",
  "Portfolio management",
  "Priority support",
];

function planLabel(billing: NonNullable<ReturnType<typeof useBillingStatus>["data"]>) {
  if (billing.isComplimentary) return "Complimentary Pro";
  if (billing.isPro) return "Pro";
  return "Free";
}

export function BillingPageClient() {
  const searchParams = useSearchParams();
  const { data: billing, isLoading, error } = useBillingStatus();
  const checkout = useStartCheckout();
  const portal = useBillingPortal();
  const syncBilling = useSyncBilling();
  const toastShown = useRef<string | null>(null);
  const billingSyncStarted = useRef(false);

  useEffect(() => {
    const upgrade = searchParams.get("upgrade");
    if (!upgrade || toastShown.current === upgrade) return;
    toastShown.current = upgrade;

    if (upgrade === "canceled") {
      toast.message("Upgrade canceled");
    }
    if (upgrade === "success") {
      toast.success("Welcome to Pro — unlimited properties unlocked");
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoading || !billing?.isOwner || billing.isComplimentary) return;
    if (billingSyncStarted.current) return;
    billingSyncStarted.current = true;

    const portalReturn = searchParams.get("portal") === "return";

    void (async () => {
      try {
        const result = await syncBilling.mutateAsync();
        if (portalReturn && result.isCanceling) {
          toast.message("Subscription canceled", {
            description: result.currentPeriodEnd
              ? `Pro access continues until ${format(new Date(result.currentPeriodEnd), "dd MMM yyyy")}.`
              : "Your plan will switch to Free at the end of the billing period.",
          });
        } else if (portalReturn) {
          toast.message("Subscription settings updated");
        }
      } catch {
        if (portalReturn) {
          toast.error("Could not refresh subscription status");
        }
      }
    })();
  }, [billing?.isOwner, billing?.isComplimentary, isLoading, searchParams, syncBilling]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="hostvia-panel hostvia-dashboard-page-inset p-8 text-center text-zinc-400">
        Could not load your plan. Try refreshing the page.
      </div>
    );
  }

  if (!billing.isOwner) {
    return (
      <div className="hostvia-panel hostvia-dashboard-page-inset p-8 text-center">
        <p className="text-zinc-300">Your account uses the host&apos;s plan.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Only the account owner can manage pricing.
        </p>
      </div>
    );
  }

  const label = planLabel(billing);
  const usagePercent = billing.isPro
    ? 100
    : Math.min(100, (billing.propertyCount / billing.freeLimit) * 100);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Account"
        title="Pricing plan"
        description="Manage your subscription and property limits."
      />

      <div className="hostvia-dashboard-page-inset grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {billing.isCanceling && billing.currentPeriodEnd ? (
          <div className="hostvia-panel flex gap-3 border-amber-500/25 bg-amber-500/10 p-4 sm:p-5 lg:col-span-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-medium text-amber-100">
                Subscription canceled
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-200/80">
                Your Pro plan stays active until{" "}
                <span className="font-medium text-amber-100">
                  {format(new Date(billing.currentPeriodEnd), "dd MMM yyyy")}
                </span>
                . After that, your account returns to the Free plan (up to{" "}
                {billing.freeLimit} properties).
              </p>
            </div>
          </div>
        ) : null}

        {/* Current plan */}
        <div className="hostvia-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Current plan
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{label}</h2>
              {billing.isComplimentary && (
                <p className="mt-2 text-sm text-emerald-300/90">
                  Full access granted — no payment required.
                </p>
              )}
              {billing.isPro && !billing.isComplimentary && (
                <p className="mt-2 text-sm text-zinc-400">
                  {billing.isCanceling
                    ? "Canceled via Stripe"
                    : `Billed via Stripe · ${PRO_LAUNCH_PRICE_EUR}€/month`}
                </p>
              )}
              {!billing.isPro && (
                <p className="mt-2 text-sm text-zinc-400">
                  Free for up to {billing.freeLimit} properties.
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn(
                billing.isCanceling
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : billing.isPro
                    ? "border-violet-500/30 bg-violet-500/10 text-violet-200"
                    : "border-white/15 text-zinc-400"
              )}
            >
              {billing.isCanceling ? "Canceling" : billing.subscriptionStatus}
            </Badge>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-400">
                <Building2 className="h-4 w-4" />
                Properties used
              </span>
              <span className="font-medium text-white">
                {billing.propertyCount}
                {!billing.isPro && (
                  <span className="text-zinc-500"> / {billing.freeLimit}</span>
                )}
                {billing.isPro && (
                  <span className="text-zinc-500"> · unlimited</span>
                )}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  billing.requiresUpgrade
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-violet-500 to-cyan-500"
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {billing.requiresUpgrade && (
              <p className="mt-2 text-sm text-amber-300">
                You&apos;ve reached the free limit. Upgrade to add more
                properties.
              </p>
            )}
          </div>

          {billing.currentPeriodEnd &&
            billing.isPro &&
            !billing.isComplimentary &&
            !billing.isCanceling && (
            <p className="mt-6 text-sm text-zinc-500">
              Current period ends{" "}
              <span className="text-zinc-300">
                {format(new Date(billing.currentPeriodEnd), "dd MMM yyyy")}
              </span>
            </p>
          )}

          {billing.canManageSubscription && (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-medium text-white">
                Manage subscription
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Update payment method, view invoices, or cancel your Pro plan in
                Stripe&apos;s secure billing portal.
              </p>
              <Button
                type="button"
                variant="outline"
                className="hostvia-dashboard-btn mt-4 h-11 gap-2 border-white/15 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06] hover:text-white"
                disabled={portal.isPending}
                onClick={() => portal.mutate()}
              >
                {portal.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening Stripe…
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Manage in Stripe
                  </>
                )}
              </Button>
            </div>
          )}

          {!billing.isPro && !billing.isComplimentary && (
            <div className="mt-8 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-lg text-zinc-500 line-through">
                  {PRO_REGULAR_PRICE_EUR}€
                </span>
                <span className="text-3xl font-bold text-white">
                  {PRO_LAUNCH_PRICE_EUR}€
                  <span className="text-base font-normal text-zinc-400">
                    /month
                  </span>
                </span>
                <span className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Launch price
                </span>
              </div>
              <Button
                className="hostvia-btn-gradient mt-5 h-11 w-full font-semibold sm:w-auto sm:min-w-[220px]"
                disabled={checkout.isPending}
                onClick={() => checkout.mutate()}
              >
                {checkout.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
              <p className="mt-3 text-xs text-zinc-500">
                Secure checkout via Stripe. Cancel anytime.
              </p>
            </div>
          )}

          {billing.isPro &&
            !billing.isComplimentary &&
            !billing.canManageSubscription && (
            <p className="mt-6 text-xs text-zinc-500">
              Subscription managed via Stripe. Contact support if you need help
              with billing.
            </p>
          )}
        </div>

        {/* Features */}
        <div className="hostvia-panel p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {billing.isPro ? "Your Pro includes" : "Included in Free"}
          </p>
          <ul className="mt-5 space-y-3">
            {(billing.isPro ? proFeatures : freeFeatures).map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-zinc-300"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-500/15">
                  <Check className="h-3 w-3 text-violet-300" />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {!billing.isPro && (
            <div className="mt-8 rounded-lg border border-white/8 bg-white/[0.02] p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-white">
                <Crown className="h-4 w-4 text-violet-400" />
                Need more than {FREE_PROPERTY_LIMIT} properties?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Pro unlocks unlimited listings for {PRO_LAUNCH_PRICE_EUR}€/month
                during our launch period.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
