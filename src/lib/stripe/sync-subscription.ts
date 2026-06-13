import type Stripe from "stripe";
import { mapStripeSubscriptionStatus } from "@/lib/subscriptions/access";
import { suggestUsernameFromEmail } from "@/lib/public/slug";
import { createServiceClient } from "@/lib/supabase/service";

export async function syncSubscriptionToHost(
  subscription: Stripe.Subscription,
  hostId: string
) {
  const admin = createServiceClient();
  const status = mapStripeSubscriptionStatus(subscription.status);
  const periodEndUnix = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;
  const periodEnd = periodEndUnix
    ? new Date(periodEndUnix * 1000).toISOString()
    : null;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const { error } = await admin
    .from("host_profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: status,
      subscription_current_period_end: periodEnd,
    })
    .eq("id", hostId);

  if (error) throw error;
}

/** @deprecated Use syncSubscriptionToHost */
export const syncSubscriptionToUser = syncSubscriptionToHost;

export async function resetHostSubscription(hostId: string) {
  const admin = createServiceClient();

  const { error } = await admin
    .from("host_profiles")
    .update({
      stripe_subscription_id: null,
      subscription_status: "free",
      subscription_current_period_end: null,
    })
    .eq("id", hostId);

  if (error) throw error;
}

/** @deprecated Use resetHostSubscription */
export const resetUserSubscription = resetHostSubscription;

export async function ensureStripeCustomer(
  hostId: string,
  email: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) return existingCustomerId;

  const { getStripe } = await import("@/lib/stripe/stripe");
  const stripe = getStripe();
  const admin = createServiceClient();

  const customer = await stripe.customers.create({
    email,
    metadata: { userId: hostId },
  });

  const { data: existing } = await admin
    .from("host_profiles")
    .select("id")
    .eq("id", hostId)
    .maybeSingle();

  if (existing) {
    await admin
      .from("host_profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", hostId);
  } else {
    const username = suggestUsernameFromEmail(email);
    await admin.from("host_profiles").insert({
      id: hostId,
      username,
      business_name: username,
      stripe_customer_id: customer.id,
      subscription_status: "free",
      is_published: false,
    });
  }

  return customer.id;
}
