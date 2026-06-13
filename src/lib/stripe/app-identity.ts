import "server-only";

import type Stripe from "stripe";
import { loadStripeConfigFromDb } from "@/lib/stripe/config-store";

export const DEFAULT_STRIPE_APPLICATION_ID = "hostvia";
export const STRIPE_METADATA_APP_ID_KEY = "appId";
export const STRIPE_METADATA_USER_ID_KEY = "userId";
export const STRIPE_METADATA_BILLING_ENV_KEY = "billingEnv";

export type StripeAppIdentity = {
  applicationId: string;
  testHostIds: string[];
  stripeMode: "test" | "live" | "unknown";
};

let cachedIdentity: StripeAppIdentity | null = null;
let cachedIdentityAt = 0;
const CACHE_TTL_MS = 60_000;

function stripeModeFromSecretKey(secretKey: string | null | undefined): StripeAppIdentity["stripeMode"] {
  if (!secretKey) return "unknown";
  if (secretKey.startsWith("sk_test_")) return "test";
  if (secretKey.startsWith("sk_live_")) return "live";
  return "unknown";
}

function parseTestHostIdsFromEnv(): string[] {
  const raw = process.env.STRIPE_TEST_HOST_IDS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function normalizeTestHostIds(values: string[] | null | undefined): string[] {
  if (!values?.length) return [];
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function invalidateStripeAppIdentityCache() {
  cachedIdentity = null;
  cachedIdentityAt = 0;
}

export async function loadStripeAppIdentity(): Promise<StripeAppIdentity> {
  const now = Date.now();
  if (cachedIdentity && now - cachedIdentityAt < CACHE_TTL_MS) {
    return cachedIdentity;
  }

  const config = await loadStripeConfigFromDb();
  const secretKey =
    config?.secret_key?.trim() ||
    process.env.STRIPE_SECRET_KEY?.trim() ||
    null;

  const applicationId =
    config?.application_id?.trim() ||
    process.env.STRIPE_APPLICATION_ID?.trim() ||
    DEFAULT_STRIPE_APPLICATION_ID;

  const testHostIds = normalizeTestHostIds([
    ...(config?.test_host_ids ?? []),
    ...parseTestHostIdsFromEnv(),
  ]);

  const identity: StripeAppIdentity = {
    applicationId,
    testHostIds,
    stripeMode: stripeModeFromSecretKey(secretKey),
  };

  cachedIdentity = identity;
  cachedIdentityAt = now;
  return identity;
}

export function isTestHostId(
  hostId: string,
  identity: StripeAppIdentity
): boolean {
  return identity.testHostIds.includes(hostId.trim());
}

export function buildHostStripeMetadata(
  hostId: string,
  identity: StripeAppIdentity
): Record<string, string> {
  return {
    [STRIPE_METADATA_APP_ID_KEY]: identity.applicationId,
    [STRIPE_METADATA_USER_ID_KEY]: hostId,
    [STRIPE_METADATA_BILLING_ENV_KEY]: isTestHostId(hostId, identity)
      ? "test"
      : identity.stripeMode === "live"
        ? "live"
        : "sandbox",
  };
}

export function metadataMatchesApplication(
  metadata: Stripe.Metadata | null | undefined,
  applicationId: string
): boolean {
  const value = metadata?.[STRIPE_METADATA_APP_ID_KEY]?.trim();
  if (!value) return false;
  return value === applicationId;
}

export function getAppIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined
): string | null {
  return metadata?.[STRIPE_METADATA_APP_ID_KEY]?.trim() || null;
}

export function shouldSkipEventForApplication(
  metadata: Stripe.Metadata | null | undefined,
  applicationId: string
): boolean {
  const appId = getAppIdFromMetadata(metadata);
  return Boolean(appId && appId !== applicationId);
}

export async function shouldProcessStripeWebhookEvent(
  event: Stripe.Event
): Promise<boolean> {
  const identity = await loadStripeAppIdentity();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (shouldSkipEventForApplication(session.metadata, identity.applicationId)) {
        return false;
      }
      if (metadataMatchesApplication(session.metadata, identity.applicationId)) {
        return true;
      }
      return Boolean(session.metadata?.userId?.trim());
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      if (
        shouldSkipEventForApplication(subscription.metadata, identity.applicationId)
      ) {
        return false;
      }
      if (
        metadataMatchesApplication(subscription.metadata, identity.applicationId)
      ) {
        return true;
      }

      const { resolveHostIdForStripeSubscription } = await import(
        "@/lib/stripe/resolve-subscription-host"
      );
      return Boolean(await resolveHostIdForStripeSubscription(subscription));
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };
      if (shouldSkipEventForApplication(invoice.metadata, identity.applicationId)) {
        return false;
      }
      if (metadataMatchesApplication(invoice.metadata, identity.applicationId)) {
        return true;
      }

      const subscriptionRef = invoice.subscription;
      if (!subscriptionRef) return false;

      const { getStripe } = await import("@/lib/stripe/stripe");
      const { resolveHostIdForStripeSubscription } = await import(
        "@/lib/stripe/resolve-subscription-host"
      );
      const stripe = await getStripe();
      const subscriptionId =
        typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (
        shouldSkipEventForApplication(subscription.metadata, identity.applicationId)
      ) {
        return false;
      }
      if (
        metadataMatchesApplication(subscription.metadata, identity.applicationId)
      ) {
        return true;
      }

      return Boolean(await resolveHostIdForStripeSubscription(subscription));
    }

    default:
      return false;
  }
}

export async function assertCheckoutSessionBelongsToApplication(
  session: Stripe.Checkout.Session
): Promise<void> {
  const identity = await loadStripeAppIdentity();

  if (shouldSkipEventForApplication(session.metadata, identity.applicationId)) {
    throw new Error(
      "This payment session belongs to another application on the same Stripe account."
    );
  }

  if (metadataMatchesApplication(session.metadata, identity.applicationId)) {
    return;
  }

  if (session.metadata?.userId?.trim()) {
    return;
  }

  throw new Error(
    "This payment session is missing Hostvia billing metadata."
  );
}

export function validateApplicationId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Application ID is required.";
  if (!/^[a-z0-9][a-z0-9._-]{1,62}$/i.test(trimmed)) {
    return "Use 2–63 characters: letters, numbers, dots, dashes, underscores.";
  }
  return null;
}
