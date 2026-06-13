import {
  FREE_PROPERTY_LIMIT,
  type SubscriptionRecord,
  type SubscriptionStatus,
} from "@/lib/subscriptions/plans";

export function hasProAccess(subscription: SubscriptionRecord | null): boolean {
  if (!subscription) return false;

  if (subscription.pro_access_granted) return true;

  const status = subscription.subscription_status;

  if (status === "active" || status === "past_due") {
    return true;
  }

  if (status === "canceled" && subscription.subscription_current_period_end) {
    return new Date(subscription.subscription_current_period_end) > new Date();
  }

  return false;
}

export function propertyLimit(subscription: SubscriptionRecord | null): number {
  return hasProAccess(subscription) ? Infinity : FREE_PROPERTY_LIMIT;
}

export function canAddProperty(
  currentCount: number,
  subscription: SubscriptionRecord | null
): boolean {
  return currentCount < propertyLimit(subscription);
}

export function requiresUpgradeForPropertyCount(
  currentCount: number,
  subscription: SubscriptionRecord | null
): boolean {
  return !canAddProperty(currentCount, subscription);
}

export function mapStripeSubscriptionStatus(
  stripeStatus: string
): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    default:
      return "free";
  }
}
