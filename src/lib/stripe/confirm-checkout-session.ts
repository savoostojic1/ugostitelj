import type Stripe from "stripe";
import { suggestUsernameFromEmail } from "@/lib/public/slug";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/stripe";
import {
  getStripeCustomerId,
  resolveHostIdForStripeSubscription,
} from "@/lib/stripe/resolve-subscription-host";
import { syncSubscriptionToHost } from "@/lib/stripe/sync-subscription";

export type ConfirmCheckoutResult = {
  hostId: string;
  subscriptionId: string;
  subscriptionStatus: string;
};

export async function confirmCheckoutSession(
  sessionId: string,
  expectedHostId: string
): Promise<ConfirmCheckoutResult> {
  const stripe = await getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.mode !== "subscription") {
    throw new Error("Checkout session is not a subscription.");
  }

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    throw new Error("Payment has not completed yet. Please wait a moment.");
  }

  const sessionHostId = session.metadata?.userId?.trim();
  if (sessionHostId && sessionHostId !== expectedHostId) {
    throw new Error("This checkout session belongs to another account.");
  }

  let subscription = session.subscription;
  if (!subscription) {
    throw new Error("No subscription found on checkout session.");
  }

  if (typeof subscription === "string") {
    subscription = await stripe.subscriptions.retrieve(subscription);
  }

  const hostId = await resolveHostIdForStripeSubscription(subscription, session);
  if (!hostId) {
    throw new Error("Could not match this payment to your account.");
  }

  if (hostId !== expectedHostId) {
    throw new Error("This checkout session belongs to another account.");
  }

  await syncSubscriptionToHost(subscription, hostId);

  return {
    hostId,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
  };
}

export async function ensureHostProfileExists(hostId: string): Promise<void> {
  const admin = createServiceClient();

  const { data: existing } = await admin
    .from("host_profiles")
    .select("id")
    .eq("id", hostId)
    .maybeSingle();

  if (existing) return;

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(hostId);

  if (authError || !authData.user) {
    throw new Error("Host profile not found.");
  }

  const username = suggestUsernameFromEmail(authData.user.email ?? "host");
  const { error } = await admin.from("host_profiles").insert({
    id: hostId,
    username,
    business_name: username,
    subscription_status: "free",
    is_published: false,
  });

  if (error) throw error;
}

export async function syncSubscriptionFromStripeObject(
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session | null
): Promise<string | null> {
  const hostId = await resolveHostIdForStripeSubscription(subscription, session);
  if (!hostId) return null;

  await ensureHostProfileExists(hostId);
  await syncSubscriptionToHost(subscription, hostId);
  return hostId;
}

export { getStripeCustomerId };
