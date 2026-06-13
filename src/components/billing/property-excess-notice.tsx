"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartCheckout } from "@/hooks/use-billing";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";

interface PropertyExcessNoticeProps {
  propertyCount: number;
  lockedPropertyCount: number;
  isOwner?: boolean;
  billingHref?: string;
}

export function PropertyExcessNotice({
  propertyCount,
  lockedPropertyCount,
  isOwner = true,
  billingHref = "/dashboard/billing",
}: PropertyExcessNoticeProps) {
  const checkout = useStartCheckout();

  if (lockedPropertyCount <= 0 || !isOwner) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div>
          <p className="text-sm font-medium text-amber-100">
            {lockedPropertyCount} propert
            {lockedPropertyCount === 1 ? "y is" : "ies are"} locked on Free plan
          </p>
          <p className="mt-1 text-sm leading-relaxed text-amber-200/80">
            You have {propertyCount} listings, but Free includes only the{" "}
            {FREE_PROPERTY_LIMIT} oldest. Locked units are read-only and hidden
            from your public booking site. Upgrade to Pro or delete extras.{" "}
            <Link
              href={billingHref}
              className="text-amber-100 underline-offset-2 hover:underline"
            >
              Manage plan
            </Link>
          </p>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        className="hostvia-btn-gradient shrink-0 gap-1.5 font-semibold"
        disabled={checkout.isPending}
        onClick={() => checkout.mutate()}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {checkout.isPending ? "Redirecting…" : "Upgrade to Pro"}
      </Button>
    </div>
  );
}
