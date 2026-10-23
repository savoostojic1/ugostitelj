import { hasProAccess } from "@/lib/subscriptions/access";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";

export type AdminPlanSource = "complimentary" | "creem" | "stripe" | "free";

export type AdminHostBilling = {
  id: string;
  email: string | null;
  username: string | null;
  property_count: number;
  subscription_status: SubscriptionStatus;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  creem_customer_id: string | null;
  creem_subscription_id: string | null;
  pro_access_granted: boolean;
  pro_access_granted_at: string | null;
  pro_access_granted_note: string | null;
  is_pro: boolean;
  has_host_profile: boolean;
};

export type AdminPlanSummary = {
  planLabel: string;
  planSource: AdminPlanSource;
  propertyLimitLabel: string;
  canAddProperty: boolean;
  requiresUpgrade: boolean;
  stripeManaged: boolean;
  statusLabel: string;
};

function hasPaidPeriod(host: AdminHostBilling): boolean {
  if (
    host.subscription_status === "active" ||
    host.subscription_status === "past_due"
  ) {
    return true;
  }
  return (
    host.subscription_status === "canceled" &&
    Boolean(host.subscription_current_period_end) &&
    new Date(host.subscription_current_period_end!) > new Date()
  );
}

export function summarizeAdminPlan(host: AdminHostBilling): AdminPlanSummary {
  const subscription = {
    subscription_status: host.subscription_status,
    subscription_current_period_end: host.subscription_current_period_end,
    subscription_cancel_at_period_end: host.subscription_cancel_at_period_end,
    stripe_customer_id: host.stripe_customer_id,
    stripe_subscription_id: host.stripe_subscription_id,
    creem_customer_id: host.creem_customer_id,
    creem_subscription_id: host.creem_subscription_id,
    pro_access_granted: host.pro_access_granted,
  };

  const isPro = hasProAccess(subscription);
  const hasCreem = Boolean(host.creem_customer_id || host.creem_subscription_id);
  const hasStripe = Boolean(host.stripe_customer_id && host.stripe_subscription_id);
  const stripeManaged = hasStripe && !hasCreem && hasPaidPeriod(host);

  let planSource: AdminPlanSource = "free";
  let planLabel = "Free";

  if (host.pro_access_granted) {
    planSource = "complimentary";
    planLabel = "Complimentary Pro";
  } else if (hasPaidPeriod(host) && stripeManaged) {
    planSource = "stripe";
    planLabel = "Pro (Stripe)";
  } else if (hasPaidPeriod(host)) {
    planSource = "creem";
    if (host.subscription_cancel_at_period_end) {
      planLabel = "Pro · canceling";
    } else if (host.subscription_status === "past_due") {
      planLabel = "Pro · past due";
    } else {
      planLabel = "Pro";
    }
  }

  return {
    planLabel,
    planSource,
    propertyLimitLabel: isPro ? "Unlimited" : `${FREE_PROPERTY_LIMIT} properties`,
    canAddProperty: isPro || host.property_count < FREE_PROPERTY_LIMIT,
    requiresUpgrade: !isPro && host.property_count >= FREE_PROPERTY_LIMIT,
    stripeManaged,
    statusLabel: host.subscription_status,
  };
}
