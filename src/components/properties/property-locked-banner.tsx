"use client";

import Link from "next/link";
import { Lock, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartCheckout } from "@/hooks/use-billing";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";

interface PropertyLockedBannerProps {
  propertyName: string;
  onDelete?: () => void;
}

export function PropertyLockedBanner({
  propertyName,
  onDelete,
}: PropertyLockedBannerProps) {
  const checkout = useStartCheckout();

  return (
    <div className="hostvia-panel flex flex-col gap-4 border-amber-500/25 bg-amber-500/10 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-3">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div>
          <p className="text-sm font-medium text-amber-100">
            {propertyName} is locked
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-amber-200/80">
            Your account is on the Free plan ({FREE_PROPERTY_LIMIT} active
            properties). This listing is outside that limit, so it is read-only
            and hidden from your public booking site. Upgrade to Pro to unlock it
            again, or delete it to free up space.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-2 inline-block text-sm text-amber-100 underline-offset-2 hover:underline"
          >
            View pricing plan
          </Link>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <Button
          type="button"
          size="sm"
          className="hostvia-btn-gradient gap-1.5 font-semibold"
          disabled={checkout.isPending}
          onClick={() => checkout.mutate(undefined)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {checkout.isPending ? "Redirecting…" : "Upgrade to Pro"}
        </Button>
        {onDelete ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="hostvia-dashboard-btn gap-1.5 border-amber-500/20 text-amber-100 hover:bg-amber-500/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete property
          </Button>
        ) : null}
      </div>
    </div>
  );
}
