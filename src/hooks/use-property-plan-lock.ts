"use client";

import { useBillingStatus } from "@/hooks/use-billing";

export function usePropertyPlanLock(propertyId?: string) {
  const { data: billing } = useBillingStatus();

  const allowedPropertyIds = billing?.allowedPropertyIds ?? [];
  const isLocked = Boolean(
    propertyId &&
      billing &&
      !billing.isPro &&
      !allowedPropertyIds.includes(propertyId)
  );

  return {
    isLocked,
    isPro: billing?.isPro ?? false,
    lockedPropertyCount: billing?.lockedPropertyCount ?? 0,
    allowedPropertyIds,
  };
}
