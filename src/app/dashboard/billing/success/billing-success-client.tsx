"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBillingStatus, useInvalidateBillingStatus } from "@/hooks/use-billing";

const MAX_CONFIRM_ATTEMPTS = 15;

export default function BillingSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: billing, refetch } = useBillingStatus();
  const invalidateBilling = useInvalidateBillingStatus();
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(Boolean(sessionId));
  const confirmStarted = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/dashboard/billing");
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (!sessionId || confirmStarted.current) return;
    confirmStarted.current = true;

    let cancelled = false;

    async function runConfirmLoop() {
      for (let attempt = 1; attempt <= MAX_CONFIRM_ATTEMPTS; attempt++) {
        if (cancelled) return;

        try {
          const res = await fetch("/api/billing/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const data = (await res.json()) as {
            error?: string;
            isPro?: boolean;
          };

          if (res.ok && data.isPro) {
            invalidateBilling();
            await refetch();
            setConfirmError(null);
            setConfirming(false);
            return;
          }

          if (!res.ok && data.error) {
            setConfirmError(data.error);
          }
        } catch {
          if (!cancelled) {
            setConfirmError("Could not confirm payment. Retrying…");
          }
        }

        if (attempt < MAX_CONFIRM_ATTEMPTS) {
          await new Promise((resolve) => window.setTimeout(resolve, 2000));
          await refetch();
        }
      }

      if (!cancelled) {
        setConfirming(false);
        setConfirmError((current) =>
          current ??
          "Payment was received but Pro is still activating. Refresh in a minute or contact support if this persists."
        );
      }
    }

    void runConfirmLoop();

    return () => {
      cancelled = true;
    };
  }, [sessionId, invalidateBilling, refetch]);

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
      {confirmError && !ready ? (
        <p className="mt-4 max-w-md text-sm text-amber-300">{confirmError}</p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          className="hostvia-btn-gradient font-semibold"
          disabled={confirming && !ready}
          onClick={() =>
            router.push(
              ready ? "/dashboard/billing?upgrade=success" : "/dashboard/billing"
            )
          }
        >
          {ready ? "View pricing plan" : "Go to pricing plan"}
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
