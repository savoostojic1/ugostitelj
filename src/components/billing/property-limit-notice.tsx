"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartCheckout } from "@/hooks/use-billing";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";

interface PropertyLimitNoticeProps {
  propertyCount: number;
  isPro: boolean;
  isOwner?: boolean;
}

export function PropertyLimitNotice({
  propertyCount,
  isPro,
  isOwner = true,
}: PropertyLimitNoticeProps) {
  const checkout = useStartCheckout();

  if (isPro || propertyCount < FREE_PROPERTY_LIMIT || !isOwner) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-300">
        You are using{" "}
        <span className="font-semibold text-white">
          {propertyCount} of {FREE_PROPERTY_LIMIT}
        </span>{" "}
        free properties.
      </p>
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
