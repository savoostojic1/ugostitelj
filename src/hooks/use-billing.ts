"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type BillingStatus = {
  isOwner: boolean;
  propertyCount: number;
  freeLimit: number;
  isPro: boolean;
  isComplimentary?: boolean;
  subscriptionStatus: "free" | "active" | "canceled" | "past_due";
  currentPeriodEnd: string | null;
  canAddProperty: boolean;
  requiresUpgrade: boolean;
};

const QUERY_KEY = ["billing-status"] as const;

export function useBillingStatus() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/billing/status");
      if (!res.ok) throw new Error("Could not load billing status");
      return res.json() as Promise<BillingStatus>;
    },
  });
}

export function useStartCheckout() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }
      if (!data.url) throw new Error("Missing checkout URL");
      window.location.href = data.url as string;
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    },
  });
}

export function useInvalidateBillingStatus() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: QUERY_KEY });
}
