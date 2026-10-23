import "server-only";

import { isStaleCreemUpdate } from "@/lib/creem/reduce-billing-state";
import type { ConfirmedBillingUpdate } from "@/lib/creem/subscription-actions";
import type { CreemConfig } from "@/lib/creem/config";
import { createServiceClient } from "@/lib/supabase/service";

export async function creemApiRequest(
  config: CreemConfig,
  path: string,
  body?: unknown
): Promise<{ ok: boolean; status: number; payload: unknown }> {
  if (!path.startsWith("/v1/")) {
    throw new Error("Invalid Creem API path.");
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const payload: unknown = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}

export async function applyConfirmedBillingUpdate(
  hostId: string,
  update: ConfirmedBillingUpdate
): Promise<boolean> {
  const admin = createServiceClient();
  const { data: current, error: readError } = await admin
    .from("host_profiles")
    .select("creem_subscription_updated_at")
    .eq("id", hostId)
    .maybeSingle();

  if (readError) throw readError;
  if (
    update.creemSubscriptionUpdatedAt &&
    isStaleCreemUpdate(
      current?.creem_subscription_updated_at ?? null,
      update.creemSubscriptionUpdatedAt
    )
  ) {
    return false;
  }

  const { error } = await admin
    .from("host_profiles")
    .update({
      subscription_status: update.subscriptionStatus,
      subscription_cancel_at_period_end: update.cancelAtPeriodEnd,
      subscription_current_period_end: update.currentPeriodEnd,
      ...(update.creemSubscriptionUpdatedAt
        ? { creem_subscription_updated_at: update.creemSubscriptionUpdatedAt }
        : {}),
    })
    .eq("id", hostId);

  if (error) throw error;
  return true;
}
