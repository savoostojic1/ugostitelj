import { hasProAccess } from "@/lib/subscriptions/access";
import {
  FREE_PROPERTY_LIMIT,
  type SubscriptionRecord,
} from "@/lib/subscriptions/plans";

export type PropertyPlanRow = {
  id: string;
  created_at: string;
};

export function sortPropertiesForPlan(properties: PropertyPlanRow[]): PropertyPlanRow[] {
  return [...properties].sort((a, b) => {
    const byDate = a.created_at.localeCompare(b.created_at);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}

export function getAllowedPropertyIds(
  properties: PropertyPlanRow[],
  subscription: SubscriptionRecord | null
): string[] {
  if (hasProAccess(subscription)) {
    return properties.map((property) => property.id);
  }

  return sortPropertiesForPlan(properties)
    .slice(0, FREE_PROPERTY_LIMIT)
    .map((property) => property.id);
}

export function isPropertyAllowedByPlan(
  propertyId: string,
  properties: PropertyPlanRow[],
  subscription: SubscriptionRecord | null
): boolean {
  return getAllowedPropertyIds(properties, subscription).includes(propertyId);
}

export function countLockedProperties(
  propertyCount: number,
  subscription: SubscriptionRecord | null
): number {
  if (hasProAccess(subscription)) return 0;
  return Math.max(0, propertyCount - FREE_PROPERTY_LIMIT);
}
