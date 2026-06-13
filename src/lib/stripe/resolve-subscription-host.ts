import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): string | null {
  const legacy = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;
  if (legacy) {
    return new Date(legacy * 1000).toISOString();
  }

  const item = subscription.items?.data?.[0] as
    | { current_period_end?: number }
    | undefined;
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000).toISOString();
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
    admin = createServiceClient();
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
