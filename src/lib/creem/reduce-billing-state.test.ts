import assert from "node:assert/strict";
import test from "node:test";
import { parseCreemWebhook } from "./parse-event";
import {
  applyCreemEventToState,
  type HostBillingSnapshot,
} from "./reduce-billing-state";
import { hasProAccess } from "../subscriptions/access";

const productId = "prod_hostvia_pro";
const hostId = "8d8b6c2e-4f1a-4a7e-9c1d-6b2a9f0e1c11";

function snapshot(
  overrides: Partial<HostBillingSnapshot> = {}
): HostBillingSnapshot {
  return {
    id: hostId,
    proAccessGranted: false,
    subscriptionStatus: "free",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    creemCustomerId: null,
    creemSubscriptionId: null,
    creemSubscriptionUpdatedAt: null,
    ...overrides,
  };
}

function subscriptionEvent(
  eventType: string,
  status: string,
  updatedAt: string,
  id = `evt_${eventType}_${updatedAt}`
) {
  return {
    id,
    eventType,
    created_at: Date.parse(updatedAt),
    object: {
      id: "sub_hostvia",
      object: "subscription",
      status,
      product: { id: productId },
      customer: { id: "cust_hostvia" },
      current_period_end_date: "2026-11-23T00:00:00.000Z",
      updated_at: updatedAt,
      metadata: { userId: hostId, appId: "hostvia" },
    },
  };
}

test("subscription.paid grants Pro and a repeat event is idempotent", () => {
  const state = {
    snapshot: snapshot(),
    eventIds: new Set<string>(),
  };
  const event = parseCreemWebhook(
    subscriptionEvent("subscription.paid", "active", "2026-10-23T12:00:00.000Z", "evt_paid")
  );
  assert.ok(event);

  const first = applyCreemEventToState(state, event, productId);
  const second = applyCreemEventToState(state, event, productId);

  assert.equal(first.action, "apply");
  assert.equal(first.snapshot.subscriptionStatus, "active");
  assert.equal(hasProAccess(toRecord(first.snapshot)), true);
  assert.equal(second.action, "duplicate");
  assert.equal(state.snapshot.subscriptionStatus, "active");
  assert.equal(state.eventIds.size, 1);
});

test("an older cancellation cannot downgrade a newer paid subscription", () => {
  const state = {
    snapshot: snapshot({
      subscriptionStatus: "active",
      creemCustomerId: "cust_hostvia",
      creemSubscriptionId: "sub_hostvia",
      creemSubscriptionUpdatedAt: "2026-10-23T12:00:00.000Z",
    }),
    eventIds: new Set<string>(),
  };
  const older = parseCreemWebhook(
    subscriptionEvent("subscription.canceled", "canceled", "2026-10-22T12:00:00.000Z")
  );
  assert.ok(older);

  const result = applyCreemEventToState(state, older, productId);
  assert.equal(result.action, "stale");
  assert.equal(state.snapshot.subscriptionStatus, "active");
});

test("documented lifecycle events map onto the existing plan statuses", () => {
  const cases = [
    ["subscription.past_due", "past_due", "past_due", true],
    ["subscription.scheduled_cancel", "scheduled_cancel", "active", true],
    ["subscription.unpaid", "unpaid", "canceled", false],
    ["subscription.paused", "paused", "canceled", false],
    ["subscription.expired", "active", "canceled", false],
    ["subscription.canceled", "canceled", "canceled", false],
  ] as const;

  for (const [eventType, objectStatus, expected, pro] of cases) {
    const state = {
      snapshot: snapshot(),
      eventIds: new Set<string>(),
    };
    const event = parseCreemWebhook(
      subscriptionEvent(eventType, objectStatus, "2026-10-23T12:00:00.000Z", eventType)
    );
    assert.ok(event);
    const result = applyCreemEventToState(state, event, productId);
    assert.equal(result.action, "apply", eventType);
    assert.equal(result.snapshot.subscriptionStatus, expected, eventType);
    assert.equal(hasProAccess(toRecord(result.snapshot)), pro, eventType);
    if (eventType === "subscription.scheduled_cancel") {
      assert.equal(result.snapshot.cancelAtPeriodEnd, true);
    }
  }
});

test("complimentary Pro survives a canceled Creem subscription", () => {
  const state = {
    snapshot: snapshot({ proAccessGranted: true, subscriptionStatus: "active" }),
    eventIds: new Set<string>(),
  };
  const event = parseCreemWebhook(
    subscriptionEvent("subscription.canceled", "canceled", "2026-10-23T12:00:00.000Z")
  );
  assert.ok(event);

  const result = applyCreemEventToState(state, event, productId);
  assert.equal(result.snapshot.subscriptionStatus, "canceled");
  assert.equal(result.snapshot.proAccessGranted, true);
  assert.equal(result.write?.subscriptionStatus, "canceled");
  assert.equal("proAccessGranted" in (result.write ?? {}), false);
  assert.equal(hasProAccess(toRecord(result.snapshot)), true);
});

test("a mismatched product or another app does not grant Pro", () => {
  const paid = subscriptionEvent(
    "subscription.paid",
    "active",
    "2026-10-23T12:00:00.000Z",
    "evt_other_product"
  );
  paid.object.product = { id: "prod_other" };
  const otherProduct = parseCreemWebhook(paid);
  assert.ok(otherProduct);

  const state = { snapshot: snapshot(), eventIds: new Set<string>() };
  assert.equal(applyCreemEventToState(state, otherProduct, productId).action, "skip");
  assert.equal(state.snapshot.subscriptionStatus, "free");

  const otherApp = subscriptionEvent(
    "subscription.paid",
    "active",
    "2026-10-23T12:00:00.000Z",
    "evt_other_app"
  );
  otherApp.object.metadata = { userId: hostId, appId: "other-app" };
  const parsed = parseCreemWebhook(otherApp);
  assert.ok(parsed);
  assert.equal(applyCreemEventToState(state, parsed, productId).action, "skip");
});

test("checkout completion grants access only when the subscription is active", () => {
  const completed = parseCreemWebhook({
    id: "evt_checkout",
    eventType: "checkout.completed",
    object: {
      id: "ch_1",
      product: { id: productId },
      customer: { id: "cust_hostvia" },
      metadata: { userId: hostId, appId: "hostvia" },
      subscription: {
        id: "sub_hostvia",
        status: "active",
        product: productId,
        customer: "cust_hostvia",
        updated_at: "2026-10-23T12:00:00.000Z",
        current_period_end_date: "2026-11-23T00:00:00.000Z",
      },
    },
  });
  assert.ok(completed);

  const state = { snapshot: snapshot(), eventIds: new Set<string>() };
  const result = applyCreemEventToState(state, completed, productId);
  assert.equal(result.action, "apply");
  assert.equal(result.snapshot.subscriptionStatus, "active");

  const unpaidCheckout = parseCreemWebhook({
    id: "evt_checkout_pending",
    eventType: "checkout.completed",
    object: {
      id: "ch_2",
      status: "completed",
      product: { id: productId },
      metadata: { userId: hostId, appId: "hostvia" },
    },
  });
  assert.ok(unpaidCheckout);
  assert.equal(applyCreemEventToState(state, unpaidCheckout, productId).action, "skip");
});

function toRecord(snapshot: HostBillingSnapshot) {
  return {
    subscription_status: snapshot.subscriptionStatus,
    subscription_current_period_end: snapshot.currentPeriodEnd,
    subscription_cancel_at_period_end: snapshot.cancelAtPeriodEnd,
    pro_access_granted: snapshot.proAccessGranted,
  };
}
