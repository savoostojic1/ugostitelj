import "server-only";

import { readCreemConfig, type CreemConfig } from "@/lib/creem/config";
import { isCreemSubscriptionEvent, parseCreemWebhook } from "@/lib/creem/parse-event";
import {
  reduceCreemBillingState,
  type HostBillingSnapshot,
} from "@/lib/creem/reduce-billing-state";
import { suggestUsernameFromEmail } from "@/lib/public/slug";
import { createServiceClient } from "@/lib/supabase/service";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";

type HostRow = {
  id: string;
  pro_access_granted: boolean | null;
  subscription_status: SubscriptionStatus | null;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean | null;
  creem_customer_id: string | null;
  creem_subscription_id: string | null;
  creem_subscription_updated_at: string | null;
};

const HOST_COLUMNS =
  "id, pro_access_granted, subscription_status, subscription_current_period_end, subscription_cancel_at_period_end, creem_customer_id, creem_subscription_id, creem_subscription_updated_at";

export type CreemWebhookResult = {
  status: number;
  body: {
    received: true;
    applied?: boolean;
    reason?: string;
  };
};

function toSnapshot(row: HostRow): HostBillingSnapshot {
  return {
    id: row.id,
    proAccessGranted: Boolean(row.pro_access_granted),
    subscriptionStatus: row.subscription_status ?? "free",
    currentPeriodEnd: row.subscription_current_period_end,
    cancelAtPeriodEnd: Boolean(row.subscription_cancel_at_period_end),
    creemCustomerId: row.creem_customer_id,
    creemSubscriptionId: row.creem_subscription_id,
    creemSubscriptionUpdatedAt: row.creem_subscription_updated_at,
  };
}

async function ensureHostProfile(hostId: string): Promise<void> {
  const admin = createServiceClient();
  const { data: existing, error } = await admin
    .from("host_profiles")
    .select("id")
    .eq("id", hostId)
    .maybeSingle();

  if (error) throw error;
  if (existing) return;

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(hostId);

  if (authError || !authData.user) return;

  const username = suggestUsernameFromEmail(authData.user.email ?? "host");
  const { error: insertError } = await admin.from("host_profiles").insert({
    id: hostId,
    username,
    business_name: username,
    is_published: false,
    subscription_status: "free",
  });

  if (insertError && insertError.code !== "23505") throw insertError;
}

async function findHostId(
  column: "creem_customer_id" | "creem_subscription_id",
  value: string
): Promise<string | null> {
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("host_profiles")
    .select("id")
    .eq(column, value)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function loadHost(hostId: string): Promise<HostBillingSnapshot | null> {
  const admin = createServiceClient();
  const { data, error } = await admin
    .from("host_profiles")
    .select(HOST_COLUMNS)
    .eq("id", hostId)
    .maybeSingle();

  if (error) throw error;
  return data ? toSnapshot(data as HostRow) : null;
}

async function persistEvent(input: {
  eventId: string;
  eventType: string;
  hostId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  subscriptionUpdatedAt: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  apply: boolean;
}): Promise<{ applied: boolean; reason: string }> {
  const admin = createServiceClient();
  const { data, error } = await admin.rpc("apply_creem_billing_event", {
    p_event_id: input.eventId,
    p_event_type: input.eventType,
    p_host_id: input.hostId,
    p_customer_id: input.customerId,
    p_subscription_id: input.subscriptionId,
    p_subscription_updated_at: input.subscriptionUpdatedAt,
    p_subscription_status: input.subscriptionStatus,
    p_period_end: input.periodEnd,
    p_cancel_at_period_end: input.cancelAtPeriodEnd,
    p_apply: input.apply,
  });

  if (error) throw error;

  const result = data as { applied?: boolean; reason?: string } | null;
  return {
    applied: Boolean(result?.applied),
    reason: result?.reason ?? "skipped",
  };
}

export async function processCreemWebhookPayload(
  payload: unknown,
  config: CreemConfig = readCreemConfig()
): Promise<CreemWebhookResult> {
  if (!config.productId) {
    return {
      status: 500,
      body: { received: true, applied: false, reason: "not_configured" },
    };
  }

  const event = parseCreemWebhook(payload);
  if (!event) {
    return {
      status: 400,
      body: { received: true, applied: false, reason: "invalid_payload" },
    };
  }

  if (
    isCreemSubscriptionEvent(event.eventType) &&
    (event.productConflict || event.productId !== config.productId)
  ) {
    return {
      status: 500,
      body: { received: true, applied: false, reason: "product_mismatch" },
    };
  }

  const linkedBySubscription = event.subscriptionId
    ? await findHostId("creem_subscription_id", event.subscriptionId)
    : null;
  const linkedByCustomer = event.customerId
    ? await findHostId("creem_customer_id", event.customerId)
    : null;

  let hostId = event.metadataHostId;
  const conflictsWithStoredHost = Boolean(
    hostId &&
      ((linkedBySubscription && linkedBySubscription !== hostId) ||
        (linkedByCustomer && linkedByCustomer !== hostId))
  );

  if (conflictsWithStoredHost) {
    hostId = null;
  } else if (hostId) {
    await ensureHostProfile(hostId);
  } else {
    hostId = linkedBySubscription ?? linkedByCustomer;
  }

  const snapshot = hostId ? await loadHost(hostId) : null;
  const decision = snapshot
    ? reduceCreemBillingState(snapshot, event, {
        expectedProductId: config.productId,
        eventAlreadyProcessed: false,
      })
    : null;

  const persisted = await persistEvent({
    eventId: event.id,
    eventType: event.eventType,
    hostId: snapshot?.id ?? null,
    customerId: decision?.write?.creemCustomerId ?? event.customerId,
    subscriptionId: decision?.write?.creemSubscriptionId ?? event.subscriptionId,
    subscriptionUpdatedAt:
      decision?.write?.creemSubscriptionUpdatedAt ?? event.subscriptionUpdatedAt,
    subscriptionStatus: decision?.write?.subscriptionStatus ?? null,
    periodEnd: decision?.write?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: decision?.write?.cancelAtPeriodEnd ?? false,
    apply: decision?.action === "apply",
  });

  return {
    status: 200,
    body: {
      received: true,
      applied: persisted.applied,
      reason: persisted.reason,
    },
  };
}
