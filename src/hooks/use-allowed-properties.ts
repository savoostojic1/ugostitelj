"use client";

import { useMemo } from "react";
import { useBillingStatus } from "@/hooks/use-billing";
import { useProperties, useReservations } from "@/hooks/use-properties";
import type { Property, Reservation } from "@/types/database";

function filterAllowedPropertyIds(
  billing: ReturnType<typeof useBillingStatus>["data"]
): Set<string> | null {
  if (!billing || billing.isPro) return null;
  return new Set(billing.allowedPropertyIds ?? []);
}

export function useAllowedProperties() {
  const query = useProperties();
  const { data: billing, isLoading: billingLoading } = useBillingStatus();

  const allowedProperties = useMemo(() => {
    if (!query.data) return [];
    const allowed = filterAllowedPropertyIds(billing);
    if (!allowed) return query.data;
    return query.data.filter((property) => allowed.has(property.id));
  }, [query.data, billing]);

  const lockedProperties = useMemo(() => {
    if (!query.data) return [];
    const allowed = filterAllowedPropertyIds(billing);
    if (!allowed) return [];
    return query.data.filter((property) => !allowed.has(property.id));
  }, [query.data, billing]);

  return {
    ...query,
    data: allowedProperties,
    lockedProperties,
    billing,
    isLoading: query.isLoading || billingLoading,
  };
}

export function useAllowedReservations(
  propertyId?: string,
  options?: { enabled?: boolean }
) {
  const query = useReservations(propertyId, options);
  const { data: billing, isLoading: billingLoading } = useBillingStatus();

  const allowedReservations = useMemo(() => {
    if (!query.data) return [];
    const allowed = filterAllowedPropertyIds(billing);
    if (!allowed) return query.data;
    return query.data.filter((reservation) =>
      allowed.has(reservation.property_id)
    );
  }, [query.data, billing]);

  return {
    ...query,
    data: allowedReservations,
    isLoading: query.isLoading || billingLoading,
  };
}

export type AllowedProperty = Property;
export type AllowedReservation = Reservation & {
  properties?: { name: string } | null;
};
