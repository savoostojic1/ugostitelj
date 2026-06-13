import Stripe from "stripe";
import { invalidateStripeAppIdentityCache } from "@/lib/stripe/app-identity";
import { loadStripeConfigFromDb } from "@/lib/stripe/config-store";

export type StripeConfigParts = {
  secretKey: string;
  webhookSecret: string;
  priceId: string;
  source: "env" | "supabase" | "mixed";
};

let stripeClient: Stripe | null = null;
let stripeClientKey: string | null = null;
let cachedConfig: StripeConfigParts | null = null;
let cachedConfigAt = 0;

const CACHE_TTL_MS = 60_000;

function parseBundledEnvConfig(): Partial<StripeConfigParts> | null {
  const bundled = process.env.STRIPE_CONFIG?.trim();
  if (!bundled) return null;

  const parts = bundled.split("|").map((part) => part.trim());
  if (parts.length !== 3 || parts.some((part) => !part)) return null;

  const [secretKey, webhookSecret, priceId] = parts;
  return { secretKey, webhookSecret, priceId };
}

function parseEnvConfig(): Partial<StripeConfigParts> | null {
  const bundled = parseBundledEnvConfig();
  return {
    secretKey:
      process.env.STRIPE_SECRET_KEY?.trim() ?? bundled?.secretKey ?? undefined,
    webhookSecret:
      process.env.STRIPE_WEBHOOK_SECRET?.trim() ??
      bundled?.webhookSecret ??
      undefined,
    priceId:
      process.env.STRIPE_PRICE_ID?.trim() ?? bundled?.priceId ?? undefined,
  };
}

function mergeConfigSources(
  env: Partial<StripeConfigParts> | null,
  db: {
    secret_key: string | null;
    webhook_secret: string | null;
    price_id: string | null;
  } | null
): StripeConfigParts | null {
  const secretKey = env?.secretKey ?? db?.secret_key ?? null;
  const webhookSecret = env?.webhookSecret ?? db?.webhook_secret ?? null;
  const priceId = env?.priceId ?? db?.price_id ?? null;

  if (!secretKey && !webhookSecret && !priceId) return null;

  const fromEnv = Boolean(
    env?.secretKey || env?.webhookSecret || env?.priceId
  );
  const fromDb = Boolean(
    db?.secret_key || db?.webhook_secret || db?.price_id
  );

  let source: StripeConfigParts["source"] = "supabase";
  if (fromEnv && fromDb) source = "mixed";
  else if (fromEnv) source = "env";

  return {
    secretKey: secretKey ?? "",
    webhookSecret: webhookSecret ?? "",
    priceId: priceId ?? "",
    source,
  };
}

export function invalidateStripeConfigCache() {
  cachedConfig = null;
  cachedConfigAt = 0;
  stripeClient = null;
  stripeClientKey = null;
  invalidateStripeAppIdentityCache();
}

export async function resolveStripeConfig(): Promise<StripeConfigParts | null> {
  const now = Date.now();
  if (cachedConfig && now - cachedConfigAt < CACHE_TTL_MS) {
    return cachedConfig;
  }

  const envConfig = parseEnvConfig();
  const dbConfig = await loadStripeConfigFromDb();
  const merged = mergeConfigSources(envConfig, dbConfig);

  cachedConfig = merged;
  cachedConfigAt = now;
  return merged;
}

export async function getStripe(): Promise<Stripe> {
  const config = await resolveStripeConfig();
  const secretKey = config?.secretKey?.trim();
  if (!secretKey) {
    throw new Error(
      "Stripe secret key is not configured. Add it in /admin or STRIPE_SECRET_KEY."
    );
  }

  if (stripeClient && stripeClientKey === secretKey) {
    return stripeClient;
  }

  stripeClient = new Stripe(secretKey, { typescript: true });
  stripeClientKey = secretKey;
  return stripeClient;
}

export async function hasStripeSecretKey(): Promise<boolean> {
  const config = await resolveStripeConfig();
  return Boolean(config?.secretKey?.trim());
}

export async function hasStripeConfig(): Promise<boolean> {
  const config = await resolveStripeConfig();
  return Boolean(config?.secretKey?.trim() && config?.priceId?.trim());
}

export async function getStripePriceId(): Promise<string> {
  const config = await resolveStripeConfig();
  const priceId = config?.priceId?.trim();
  if (!priceId) {
    throw new Error(
      "Stripe price ID is not configured. Add it in /admin or STRIPE_PRICE_ID."
    );
  }
  return priceId;
}

export async function getStripeWebhookSecret(): Promise<string> {
  const config = await resolveStripeConfig();
  const secret = config?.webhookSecret?.trim();
  if (!secret) {
    throw new Error(
      "Stripe webhook secret is not configured. Add it in /admin or STRIPE_WEBHOOK_SECRET."
    );
  }
  return secret;
}
