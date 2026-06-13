import type Stripe from "stripe";

type SubscriptionItemWithPeriod = {
  current_period_end?: number;
};

export function isStripeSubscriptionScheduledToCancel(
  subscription: Stripe.Subscription
): boolean {
  if (subscription.status !== "active" && subscription.status !== "trialing") {
    return false;
  }

  if (subscription.cancel_at_period_end) return true;

  return Boolean(subscription.cancel_at);
}

export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): string | null {
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000).toISOString();
  }

  const items = subscription.items?.data ?? [];
  let latestEnd: number | null = null;

  for (const item of items) {
    const itemEnd = (item as SubscriptionItemWithPeriod).current_period_end;
    if (itemEnd && (latestEnd === null || itemEnd > latestEnd)) {
      latestEnd = itemEnd;
    }
  }

  if (latestEnd) {
    return new Date(latestEnd * 1000).toISOString();
  }

  const legacy = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;
  if (legacy) {
    return new Date(legacy * 1000).toISOString();
  }

  if (subscription.ended_at) {
    return new Date(subscription.ended_at * 1000).toISOString();
  }

  return null;
}

export function getStripeCustomerId(
  customer: Stripe.Subscription["customer"]
): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

export async function resolveHostIdForStripeSubscription(
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session | null
): Promise<string | null> {
  const fromMetadata =
    subscription.metadata?.userId?.trim() ||
    session?.metadata?.userId?.trim() ||
    null;

  if (fromMetadata) return fromMetadata;

  const customerId = getStripeCustomerId(subscription.customer);
  if (!customerId) return null;

  let admin;
  try {
    admin = (await import("@/lib/supabase/service")).createServiceClient();
  } catch {
    return null;
  }

  const { data: profile } = await admin
    .from("host_profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (profile?.id) return profile.id;

  try {
    const { getStripe } = await import("@/lib/stripe/stripe");
    const stripe = await getStripe();
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted && customer.metadata?.userId?.trim()) {
      return customer.metadata.userId.trim();
    }
  } catch {
    return null;
  }

  return null;
}
