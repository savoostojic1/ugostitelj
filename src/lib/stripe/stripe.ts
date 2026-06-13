import Stripe from "stripe";

let stripeClient: Stripe | null = null;

type StripeConfigParts = {
  secretKey: string;
  webhookSecret: string;
  priceId: string;
};

function parseStripeConfig(): StripeConfigParts | null {
  const bundled = process.env.STRIPE_CONFIG?.trim();
  if (!bundled) return null;

  const parts = bundled.split("|").map((part) => part.trim());
  if (parts.length !== 3 || parts.some((part) => !part)) return null;

  const [secretKey, webhookSecret, priceId] = parts;
  return { secretKey, webhookSecret, priceId };
}

function getSecretKey(): string | null {
  return (
    process.env.STRIPE_SECRET_KEY?.trim() ??
    parseStripeConfig()?.secretKey ??
    null
  );
}

export function getStripe(): Stripe {
  const secretKey = getSecretKey();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY or STRIPE_CONFIG is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeClient;
}

export function hasStripeConfig(): boolean {
  const priceId =
    process.env.STRIPE_PRICE_ID?.trim() ?? parseStripeConfig()?.priceId;
  return Boolean(getSecretKey() && priceId);
}

export function getStripePriceId(): string {
  const priceId =
    process.env.STRIPE_PRICE_ID?.trim() ?? parseStripeConfig()?.priceId;
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID or STRIPE_CONFIG is not configured");
  }
  return priceId;
}

export function getStripeWebhookSecret(): string {
  const secret =
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ??
    parseStripeConfig()?.webhookSecret;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET or STRIPE_CONFIG is not configured"
    );
  }
  return secret;
}
