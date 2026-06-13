import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

export type StripeConfigRecord = {
  secret_key: string | null;
  webhook_secret: string | null;
  price_id: string | null;
  updated_at: string;
};

export async function loadStripeConfigFromDb(): Promise<StripeConfigRecord | null> {
  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return null;
  }

  const { data, error } = await admin
    .from("stripe_config")
    .select("secret_key, webhook_secret, price_id, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    console.error("[stripe] loadStripeConfigFromDb failed:", error.message);
    return null;
  }

  return data;
}

export async function saveStripeConfigToDb(input: {
  secretKey?: string | null;
  webhookSecret?: string | null;
  priceId?: string | null;
}): Promise<StripeConfigRecord> {
  const admin = createServiceClient();

  const { data: existing } = await admin
    .from("stripe_config")
    .select("secret_key, webhook_secret, price_id")
    .eq("id", 1)
    .maybeSingle();

  const payload = {
    secret_key:
      input.secretKey !== undefined
        ? input.secretKey?.trim() || null
        : (existing?.secret_key ?? null),
    webhook_secret:
      input.webhookSecret !== undefined
        ? input.webhookSecret?.trim() || null
        : (existing?.webhook_secret ?? null),
    price_id:
      input.priceId !== undefined
        ? input.priceId?.trim() || null
        : (existing?.price_id ?? null),
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await admin
      .from("stripe_config")
      .update(payload)
      .eq("id", 1)
      .select("secret_key, webhook_secret, price_id, updated_at")
      .single();

    if (error) {
      if (error.code === "42P01") {
        throw new Error(
          "Stripe config table missing. Run migration 032_stripe_config.sql in Supabase."
        );
      }
      throw error;
    }

    return data;
  }

  const { data, error } = await admin
    .from("stripe_config")
    .insert({ id: 1, ...payload })
    .select("secret_key, webhook_secret, price_id, updated_at")
    .single();

  if (error) {
    if (error.code === "42P01") {
      throw new Error(
        "Stripe config table missing. Run migration 032_stripe_config.sql in Supabase."
      );
    }
    throw error;
  }

  return data;
}

export function maskStripeSecret(
  value: string | null | undefined,
  visiblePrefixLength = 7
): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.length <= visiblePrefixLength + 4) {
    return `${trimmed.slice(0, Math.min(visiblePrefixLength, trimmed.length))}••••`;
  }
  return `${trimmed.slice(0, visiblePrefixLength)}••••${trimmed.slice(-4)}`;
}

export function validateStripeSecretKey(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("sk_test_") && !trimmed.startsWith("sk_live_")) {
    return "Secret key must start with sk_test_ or sk_live_";
  }
  return null;
}

export function validateStripeWebhookSecret(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("whsec_")) {
    return "Webhook secret must start with whsec_";
  }
  return null;
}

export function validateStripePriceId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("price_")) {
    return "Price ID must start with price_";
  }
  return null;
}
