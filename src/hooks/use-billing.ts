"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trackHostviaEvent } from "@/lib/analytics/track";
import {
  CREEM_CANCEL_ENDPOINT,
  CREEM_CHECKOUT_ENDPOINT,
  CREEM_PORTAL_ENDPOINT,
  CREEM_RESUME_ENDPOINT,
} from "@/lib/creem/endpoints";

export type BillingStatus = {
  isOwner: boolean;
  propertyCount: number;
  freeLimit: number;
  isPro: boolean;
  isComplimentary?: boolean;
  isTestBillingUser?: boolean;
  stripeMode?: "test" | "live" | "unknown";
  billingProvider?: "creem" | "stripe" | "none";
  inheritsHostPlan?: boolean;
  subscriptionStatus: "free" | "active" | "canceled" | "past_due";
  currentPeriodEnd: string | null;
  allowedPropertyIds?: string[];
  lockedPropertyCount?: number;
  isCanceling?: boolean;
  canManageSubscription?: boolean;
  canCancelCreem?: boolean;
  canResumeCreem?: boolean;
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
      trackHostviaEvent("upgrade_initiated", { plan: "pro" });
      const res = await fetch(CREEM_CHECKOUT_ENDPOINT, { method: "POST" });
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

export function useCreemPortal() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(CREEM_PORTAL_ENDPOINT, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not open the billing portal");
      }
      if (!data.url) throw new Error("Missing portal URL");
      window.location.href = data.url as string;
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not open the billing portal"
      );
    },
  });
}

export function useScheduleCreemCancellation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(CREEM_CANCEL_ENDPOINT, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not schedule cancellation");
      }
      return data as { scheduled?: boolean; currentPeriodEnd?: string | null };
    },
    onSuccess: () => {
      toast.success("Cancellation scheduled. Pro stays active until the period ends.");
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not schedule cancellation"
      );
    },
  });
}

export function useResumeCreemSubscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(CREEM_RESUME_ENDPOINT, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not resume the subscription");
      }
      return data as { resumed?: boolean };
    },
    onSuccess: () => {
      toast.success("Subscription resumed.");
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not resume the subscription"
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
