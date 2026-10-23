import { readCreemId } from "@/lib/creem/parse-event";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";

const CREEM_OBJECT_ID = /^[A-Za-z0-9_]+$/;

export type CreemScheduledCancelBody = {
  mode: "scheduled";
  onExecute: "cancel";
};

export type ConfirmedCreemSubscription = {
  id: string;
  status: string;
  customerId: string | null;
  productId: string | null;
  currentPeriodEnd: string | null;
  updatedAt: string | null;
};

export type ConfirmedBillingUpdate = {
  subscriptionStatus: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  creemSubscriptionUpdatedAt: string | null;
};

export function isSafeCreemObjectId(value: string | null | undefined): value is string {
  return Boolean(value && CREEM_OBJECT_ID.test(value));
}

export function buildCreemPortalBody(customerId: string): { customer_id: string } {
  if (!isSafeCreemObjectId(customerId)) {
    throw new Error("Invalid Creem customer id.");
  }
  return { customer_id: customerId };
}

export function readCreemCustomerPortalLink(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const link = (payload as { customer_portal_link?: unknown }).customer_portal_link;
  if (typeof link !== "string") return null;
  const trimmed = link.trim();
  if (!trimmed.startsWith("https://")) return null;
  return trimmed;
}

export function buildCreemScheduledCancelBody(): CreemScheduledCancelBody {
  return { mode: "scheduled", onExecute: "cancel" };
}

export function readConfirmedCreemSubscription(
  payload: unknown
): ConfirmedCreemSubscription | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const id = readCreemId(record.id);
  const status = typeof record.status === "string" ? record.status.trim() : "";
  if (!id || !status) return null;

  const periodEnd = record.current_period_end_date;
  const updatedAt = record.updated_at;

  return {
    id,
    status,
    customerId: readCreemId(record.customer),
    productId: readCreemId(record.product),
    currentPeriodEnd: typeof periodEnd === "string" && periodEnd.trim() ? periodEnd : null,
    updatedAt: typeof updatedAt === "string" && updatedAt.trim() ? updatedAt : null,
  };
}

export function confirmScheduledCancellation(input: {
  expectedSubscriptionId: string;
  expectedCustomerId: string | null;
  expectedProductId: string;
  currentStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  payload: unknown;
}): ConfirmedBillingUpdate | null {
  const confirmed = readConfirmedCreemSubscription(input.payload);
  if (!confirmed || confirmed.status !== "scheduled_cancel") return null;
  if (!subscriptionMatches(confirmed, input)) return null;

  return {
    subscriptionStatus:
      input.currentStatus === "past_due" ? "past_due" : "active",
    cancelAtPeriodEnd: true,
    currentPeriodEnd: confirmed.currentPeriodEnd ?? input.currentPeriodEnd,
    creemSubscriptionUpdatedAt: confirmed.updatedAt,
  };
}

export function confirmResumedSubscription(input: {
  expectedSubscriptionId: string;
  expectedCustomerId: string | null;
  expectedProductId: string;
  currentPeriodEnd: string | null;
  payload: unknown;
}): ConfirmedBillingUpdate | null {
  const confirmed = readConfirmedCreemSubscription(input.payload);
  if (!confirmed) return null;
  if (confirmed.status !== "active" && confirmed.status !== "trialing") return null;
  if (!subscriptionMatches(confirmed, input)) return null;

  return {
    subscriptionStatus: "active",
    cancelAtPeriodEnd: false,
    currentPeriodEnd: confirmed.currentPeriodEnd ?? input.currentPeriodEnd,
    creemSubscriptionUpdatedAt: confirmed.updatedAt,
  };
}

function subscriptionMatches(
  confirmed: ConfirmedCreemSubscription,
  expected: {
    expectedSubscriptionId: string;
    expectedCustomerId: string | null;
    expectedProductId: string;
  }
): boolean {
  if (confirmed.id !== expected.expectedSubscriptionId) return false;
  if (
    expected.expectedCustomerId &&
    confirmed.customerId !== expected.expectedCustomerId
  ) {
    return false;
  }
  if (!confirmed.productId || confirmed.productId !== expected.expectedProductId) {
    return false;
  }
  return true;
}
