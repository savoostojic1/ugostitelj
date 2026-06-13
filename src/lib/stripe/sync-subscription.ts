import type Stripe from "stripe";
import {
  resolveSubscriptionStatusFromStripe,
} from "@/lib/subscriptions/access";
import { suggestUsernameFromEmail } from "@/lib/public/slug";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getSubscriptionPeriodEnd,
  getStripeCustomerId,
  isStripeSubscriptionScheduledToCancel,
} from "@/lib/stripe/resolve-subscription-host";

export async function syncSubscriptionToHost(
  subscription: Stripe.Subscription,
  hostId: string
) {
  const admin = createServiceClient();
  const status = resolveSubscriptionStatusFromStripe(subscription);
  const periodEnd = getSubscriptionPeriodEnd(subscription);
  const customerId = getStripeCustomerId(subscription.customer);
  const scheduledCancel = isStripeSubscriptionScheduledToCancel(subscription);

  const payload = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: status,
    subscription_current_period_end: periodEnd,
    subscription_cancel_at_period_end: scheduledCancel,
  };

  const { data: updated, error } = await admin
    .from("host_profiles")
    .update(payload)
    .eq("id", hostId)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  if (!updated) {
    const { data: authData, error: authError } =
      await admin.auth.admin.getUserById(hostId);

    if (authError || !authData.user) {
      throw new Error(`Could not update subscription for host ${hostId}`);
    }

    const username = suggestUsernameFromEmail(authData.user.email ?? "host");
    const { error: insertError } = await admin.from("host_profiles").insert({
      id: hostId,
      username,
      business_name: username,
      is_published: false,
      ...payload,
    });

    if (insertError) throw insertError;
  }
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
      subscription_cancel_at_period_end: false,
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
  const { getStripe } = await import("@/lib/stripe/stripe");
  const stripe = await getStripe();

  if (existingCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(existingCustomerId);
      if (!existing.deleted) {
        return existingCustomerId;
      }
    } catch {
      // Stale customer from another Stripe mode/account — create a fresh one.
    }
  }

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
