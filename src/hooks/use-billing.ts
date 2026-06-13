"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type BillingStatus = {
  isOwner: boolean;
  propertyCount: number;
  freeLimit: number;
  isPro: boolean;
  isComplimentary?: boolean;
  inheritsHostPlan?: boolean;
  subscriptionStatus: "free" | "active" | "canceled" | "past_due";
  currentPeriodEnd: string | null;
  allowedPropertyIds?: string[];
  lockedPropertyCount?: number;
  isCanceling?: boolean;
  canManageSubscription?: boolean;
  canAddProperty: boolean;
  requiresUpgrade: boolean;
};

const QUERY_KEY = ["billing-status"] as const;

export function useBillingStatus() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/billing/status", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load billing status");
      return res.json() as Promise<BillingStatus>;
    },
    staleTime: 0,
    refetchOnMount: "always",
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

export function useBillingPortal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not open billing portal");
      }
      if (!data.url) throw new Error("Missing portal URL");
      window.location.href = data.url as string;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not open billing portal"
      );
    },
  });
}

export function useSyncBilling() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not sync billing");
      }
      return data as {
        isPro: boolean;
        isCanceling: boolean;
        subscriptionStatus: BillingStatus["subscriptionStatus"];
        currentPeriodEnd: string | null;
      };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useInvalidateBillingStatus() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: QUERY_KEY });
}
