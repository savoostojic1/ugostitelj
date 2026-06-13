import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { getSubscriptionPeriodEnd } from "@/lib/stripe/resolve-subscription-host";
import { getStripe } from "@/lib/stripe/stripe";
import {
  resetHostSubscription,
  syncSubscriptionToHost,
} from "@/lib/stripe/sync-subscription";

export async function syncHostBillingFromStripe(hostId: string): Promise<void> {
  const admin = createServiceClient();
  const { data: profile, error } = await admin
    .from("host_profiles")
    .select("stripe_subscription_id, stripe_customer_id")
    .eq("id", hostId)
    .maybeSingle();

  if (error) throw error;
  if (!profile?.stripe_subscription_id && !profile?.stripe_customer_id) {
    return;
  }

  const stripe = await getStripe();
  let subscription: Stripe.Subscription | null = null;

  if (profile.stripe_subscription_id) {
    try {
      subscription = await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id
      );
    } catch {
      subscription = null;
    }
  }

  if (!subscription && profile.stripe_customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "all",
      limit: 5,
    });

    subscription =
      subscriptions.data.find((sub) =>
        ["active", "trialing", "past_due", "canceled"].includes(sub.status)
      ) ??
      subscriptions.data[0] ??
      null;
  }

  if (!subscription) {
    await resetHostSubscription(hostId);
    return;
  }

  const periodEnd = getSubscriptionPeriodEnd(subscription);
  const ended =
    subscription.status === "canceled" &&
    periodEnd &&
    new Date(periodEnd) <= new Date();

  if (
    subscription.status === "incomplete_expired" ||
    subscription.status === "unpaid" ||
    ended
  ) {
    await resetHostSubscription(hostId);
    return;
  }

  await syncSubscriptionToHost(subscription, hostId);
}
