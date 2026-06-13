"use client";

import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStartCheckout } from "@/hooks/use-billing";
import {
  PRO_LAUNCH_PRICE_EUR,
  PRO_REGULAR_PRICE_EUR,
} from "@/lib/subscriptions/plans";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const checkout = useStartCheckout();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#0c0c12] p-0 text-white sm:max-w-lg">
        <div className="relative overflow-hidden p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl"
            aria-hidden
          />

          <DialogHeader className="relative space-y-3 text-left">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              Pro
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              Unlock Unlimited Properties
            </DialogTitle>
            <p className="text-sm leading-relaxed text-zinc-400">
              You&apos;re currently using the Free plan, which includes up to 2
              properties.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Upgrade to Pro to manage unlimited properties, synchronize all
              calendars, and grow your rental business from a single dashboard.
            </p>
          </DialogHeader>

          <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-lg text-zinc-500 line-through">
                {PRO_REGULAR_PRICE_EUR}€/month
              </span>
              <span className="text-3xl font-bold tracking-tight text-white">
                {PRO_LAUNCH_PRICE_EUR}€
                <span className="text-base font-medium text-zinc-400">
                  /month
                </span>
              </span>
              <span className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                Launch Discount
              </span>
            </div>
          </div>

          <div className="relative mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button
              type="button"
              className="hostvia-btn-gradient h-11 flex-1 font-semibold"
              disabled={checkout.isPending}
              onClick={() => checkout.mutate()}
            >
              {checkout.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hostvia-dashboard-btn h-11 flex-1 border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              disabled={checkout.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
