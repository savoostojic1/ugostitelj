import { CREEM_METADATA_APP_ID } from "@/lib/creem/checkout-request";
import {
  isCreemSubscriptionEvent,
  type ParsedCreemEvent,
} from "@/lib/creem/parse-event";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";

export type HostBillingSnapshot = {
  id: string;
  proAccessGranted: boolean;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  creemCustomerId: string | null;
  creemSubscriptionId: string | null;
  creemSubscriptionUpdatedAt: string | null;
};

export type CreemBillingWrite = {
  subscriptionStatus: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  creemCustomerId: string | null;
  creemSubscriptionId: string | null;
  creemSubscriptionUpdatedAt: string | null;
};

export type CreemReduceAction = "duplicate" | "skip" | "stale" | "apply";

export type CreemReduceResult = {
  action: CreemReduceAction;
  snapshot: HostBillingSnapshot;
  write: CreemBillingWrite | null;
};

export function isStaleCreemUpdate(
  storedUpdatedAt: string | null,
  incomingUpdatedAt: string | null
): boolean {
  if (!storedUpdatedAt) return false;
  if (!incomingUpdatedAt) return true;

  const stored = Date.parse(storedUpdatedAt);
  const incoming = Date.parse(incomingUpdatedAt);
  if (Number.isNaN(stored)) return false;
  if (Number.isNaN(incoming)) return true;
  return incoming < stored;
}

export function mapCreemAccess(event: ParsedCreemEvent): CreemBillingWrite | null {
  if (!isCreemSubscriptionEvent(event.eventType)) return null;
  if (!event.subscriptionId || !event.customerId) return null;

  const mapped = mapStatus(event.eventType, event.subscriptionStatus);
  if (!mapped) return null;

  return {
    subscriptionStatus: mapped.subscriptionStatus,
    cancelAtPeriodEnd: mapped.cancelAtPeriodEnd,
    currentPeriodEnd: event.currentPeriodEnd,
    creemCustomerId: event.customerId,
    creemSubscriptionId: event.subscriptionId,
    creemSubscriptionUpdatedAt: event.subscriptionUpdatedAt,
  };
}

function mapStatus(
  eventType: ParsedCreemEvent["eventType"],
  subscriptionStatus: string | null
): { subscriptionStatus: SubscriptionStatus; cancelAtPeriodEnd: boolean } | null {
  switch (eventType) {
    case "subscription.scheduled_cancel":
      return { subscriptionStatus: "active", cancelAtPeriodEnd: true };
    case "subscription.canceled":
    case "subscription.expired":
    case "subscription.paused":
    case "subscription.unpaid":
      return { subscriptionStatus: "canceled", cancelAtPeriodEnd: false };
    case "subscription.past_due":
      return { subscriptionStatus: "past_due", cancelAtPeriodEnd: false };
    case "checkout.completed":
    case "subscription.active":
    case "subscription.paid":
    case "subscription.trialing":
    case "subscription.update":
      return mapObjectStatus(subscriptionStatus);
    default:
      return null;
  }
}

function mapObjectStatus(
  subscriptionStatus: string | null
): { subscriptionStatus: SubscriptionStatus; cancelAtPeriodEnd: boolean } | null {
  switch (subscriptionStatus) {
    case "active":
    case "trialing":
      return { subscriptionStatus: "active", cancelAtPeriodEnd: false };
    case "scheduled_cancel":
      return { subscriptionStatus: "active", cancelAtPeriodEnd: true };
    case "past_due":
      return { subscriptionStatus: "past_due", cancelAtPeriodEnd: false };
    case "canceled":
    case "unpaid":
    case "paused":
      return { subscriptionStatus: "canceled", cancelAtPeriodEnd: false };
    default:
      return null;
  }
}

export function reduceCreemBillingState(
  snapshot: HostBillingSnapshot,
  event: ParsedCreemEvent,
  options: {
    expectedProductId: string;
    eventAlreadyProcessed: boolean;
  }
): CreemReduceResult {
  const unchanged = (action: CreemReduceAction): CreemReduceResult => ({
    action,
    snapshot,
    write: null,
  });

  if (options.eventAlreadyProcessed) return unchanged("duplicate");

  if (
    event.metadataAppId &&
    event.metadataAppId !== CREEM_METADATA_APP_ID
  ) {
    return unchanged("skip");
  }

  if (
    event.metadataHostId &&
    event.metadataHostId !== snapshot.id
  ) {
    return unchanged("skip");
  }

  if (event.productConflict || event.productId !== options.expectedProductId) {
    return unchanged("skip");
  }

  const write = mapCreemAccess(event);
  if (!write) return unchanged("skip");

  if (
    isStaleCreemUpdate(
      snapshot.creemSubscriptionUpdatedAt,
      event.subscriptionUpdatedAt
    )
  ) {
    return unchanged("stale");
  }

  return {
    action: "apply",
    write,
    snapshot: {
      ...snapshot,
      proAccessGranted: snapshot.proAccessGranted,
      subscriptionStatus: write.subscriptionStatus,
      currentPeriodEnd: write.currentPeriodEnd ?? snapshot.currentPeriodEnd,
      cancelAtPeriodEnd: write.cancelAtPeriodEnd,
      creemCustomerId: write.creemCustomerId,
      creemSubscriptionId: write.creemSubscriptionId,
      creemSubscriptionUpdatedAt:
        write.creemSubscriptionUpdatedAt ?? snapshot.creemSubscriptionUpdatedAt,
    },
  };
}

export function applyCreemEventToState(
  state: {
    snapshot: HostBillingSnapshot;
    eventIds: Set<string>;
  },
  event: ParsedCreemEvent,
  expectedProductId: string
): CreemReduceResult {
  const result = reduceCreemBillingState(state.snapshot, event, {
    expectedProductId,
    eventAlreadyProcessed: state.eventIds.has(event.id),
  });

  if (result.action !== "duplicate") {
    state.eventIds.add(event.id);
  }

  if (result.action === "apply") {
    state.snapshot = result.snapshot;
  }

  return result;
}
