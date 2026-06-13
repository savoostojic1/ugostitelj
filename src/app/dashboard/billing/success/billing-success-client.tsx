"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBillingStatus, useInvalidateBillingStatus } from "@/hooks/use-billing";

export default function BillingSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: billing, refetch, isFetching } = useBillingStatus();
  const invalidateBilling = useInvalidateBillingStatus();

  useEffect(() => {
    if (!sessionId) return;

    const timer = window.setInterval(() => {
      void refetch();
    }, 2000);

    return () => window.clearInterval(timer);
  }, [sessionId, refetch]);

  useEffect(() => {
    if (billing?.isPro) {
      invalidateBilling();
    }
  }, [billing?.isPro, invalidateBilling]);

  const ready = billing?.isPro;

  return (
    <div className="hostvia-panel mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      {ready ? (
        <CheckCircle2 className="h-14 w-14 text-emerald-400" />
      ) : (
        <Loader2 className="h-14 w-14 animate-spin text-violet-400" />
      )}
      <h1 className="mt-6 text-2xl font-bold text-white">
        {ready ? "You're on Pro" : "Activating Pro…"}
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        {ready
          ? "Unlimited properties are now unlocked. Add your next listing anytime."
          : "We're confirming your payment with Stripe. This usually takes a few seconds."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          className="hostvia-btn-gradient font-semibold"
          disabled={!ready && isFetching}
          onClick={() =>
            router.push(
              ready ? "/dashboard/billing?upgrade=success" : "/dashboard/billing"
            )
          }
        >
          {ready ? "View pricing plan" : "Continue to dashboard"}
        </Button>
        {!ready ? (
          <Button variant="outline" className="hostvia-dashboard-btn" asChild>
            <Link href="/dashboard/billing">Skip for now</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
