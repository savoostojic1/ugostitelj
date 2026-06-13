import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  resetUserSubscription,
  syncSubscriptionToUser,
} from "@/lib/stripe/sync-subscription";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );
  } catch (err) {
    console.error("[stripe webhook]", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(
          String(session.subscription)
        );
        const userId =
          subscription.metadata.userId ??
          session.metadata?.userId ??
          null;

        if (userId) {
          await syncSubscriptionToUser(subscription, userId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        if (userId) {
          await syncSubscriptionToUser(subscription, userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        if (userId) {
          await resetUserSubscription(userId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionRef = (
          invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
        ).subscription;
        if (!subscriptionRef) break;

        const stripe = getStripe();
        const subscriptionId =
          typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata.userId;
        if (userId) {
          await syncSubscriptionToUser(subscription, userId);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook handler]", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
