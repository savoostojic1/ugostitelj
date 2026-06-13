import {
  FREE_PROPERTY_LIMIT,
  type SubscriptionRecord,
  type SubscriptionStatus,
} from "@/lib/subscriptions/plans";
import {
  isStripeSubscriptionScheduledToCancel,
} from "@/lib/stripe/resolve-subscription-host";
import type Stripe from "stripe";

export function hasProAccess(subscription: SubscriptionRecord | null): boolean {
  if (!subscription) return false;

  if (subscription.pro_access_granted) return true;

  const status = subscription.subscription_status;

  if (status === "active" || status === "past_due") {
    return true;
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

export function resolveSubscriptionStatusFromStripe(
  subscription: Stripe.Subscription
): SubscriptionStatus {
  if (isStripeSubscriptionScheduledToCancel(subscription)) {
    return "active";
  }

  return mapStripeSubscriptionStatus(subscription.status);
}

export function isSubscriptionCanceling(
  subscription: SubscriptionRecord | null,
  isPro: boolean
): boolean {
  if (!subscription || !isPro || subscription.pro_access_granted) return false;

  return Boolean(
    subscription.subscription_cancel_at_period_end &&
      (subscription.subscription_status === "active" ||
        subscription.subscription_status === "past_due")
  );
}
