import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { authorizeCreemBillingAction, type CreemBillingAuthDecision } from "./authorize-billing";
import {
  CREEM_CANCEL_ENDPOINT,
  CREEM_CHECKOUT_ENDPOINT,
  CREEM_PORTAL_ENDPOINT,
  CREEM_RESUME_ENDPOINT,
} from "./endpoints";
import { hasProAccess } from "../subscriptions/access";
import {
  buildCreemPortalBody,
  buildCreemScheduledCancelBody,
  confirmResumedSubscription,
  confirmScheduledCancellation,
  readCreemCustomerPortalLink,
} from "./subscription-actions";

const hostId = "8d8b6c2e-4f1a-4a7e-9c1d-6b2a9f0e1c11";

const owner = {
  userId: hostId,
  isOwner: true,
  apiKeyConfigured: true,
  complimentary: false,
  creemCustomerId: "cust_hostvia",
  creemSubscriptionId: "sub_hostvia",
} as const;

test("upgrade checkout is routed to the Creem endpoint", () => {
  assert.equal(CREEM_CHECKOUT_ENDPOINT, "/api/billing/creem/checkout");
  assert.notEqual(CREEM_CHECKOUT_ENDPOINT, "/api/billing/checkout");

  const hook = readFileSync("src/hooks/use-billing.ts", "utf8");
  assert.match(hook, /fetch\(CREEM_CHECKOUT_ENDPOINT/);
  assert.equal(hook.includes('"/api/billing/checkout"'), false);

  const upgradeFiles = [
    "src/components/billing/billing-page-client.tsx",
    "src/components/billing/upgrade-modal.tsx",
    "src/components/billing/property-limit-notice.tsx",
    "src/components/billing/property-excess-notice.tsx",
    "src/components/properties/property-locked-banner.tsx",
  ];
  for (const file of upgradeFiles) {
    const source = readFileSync(file, "utf8");
    assert.equal(source.includes('"/api/billing/checkout"'), false, file);
    assert.equal(source.includes("useStartCheckout"), true, file);
  }
});

test("portal, cancel, and resume stay behind owner authorization", () => {
  assert.equal(CREEM_PORTAL_ENDPOINT, "/api/billing/creem/portal");
  assert.equal(CREEM_CANCEL_ENDPOINT, "/api/billing/creem/cancel");
  assert.equal(CREEM_RESUME_ENDPOINT, "/api/billing/creem/resume");

  const decisions = [
    authorizeCreemBillingAction({ ...owner, action: "portal" }),
    authorizeCreemBillingAction({ ...owner, action: "portal", userId: null }),
    authorizeCreemBillingAction({ ...owner, action: "cancel", isOwner: false }),
    authorizeCreemBillingAction({ ...owner, action: "resume", complimentary: true }),
    authorizeCreemBillingAction({ ...owner, action: "portal", creemCustomerId: null }),
    authorizeCreemBillingAction({
      ...owner,
      action: "cancel",
      creemSubscriptionId: null,
    }),
    authorizeCreemBillingAction({ ...owner, action: "portal", apiKeyConfigured: false }),
  ];

  assert.deepEqual(decisions.map(decisionStatus), [null, 401, 403, 400, 400, 400, 503]);
});

test("portal and scheduled cancellation use the documented request fields", () => {
  assert.deepEqual(buildCreemPortalBody("cust_hostvia"), {
    customer_id: "cust_hostvia",
  });
  assert.deepEqual(buildCreemScheduledCancelBody(), {
    mode: "scheduled",
    onExecute: "cancel",
  });
  assert.equal(
    readCreemCustomerPortalLink({
      customer_portal_link: "https://creem.io/my-orders/login/example",
    }),
    "https://creem.io/my-orders/login/example"
  );
  assert.equal(readCreemCustomerPortalLink({ customer_portal_link: "javascript:alert(1)" }), null);
});

test("a scheduled cancellation keeps Pro until the confirmed period ends", () => {
  const update = confirmScheduledCancellation({
    expectedSubscriptionId: "sub_hostvia",
    expectedCustomerId: "cust_hostvia",
    expectedProductId: "prod_hostvia_pro",
    currentStatus: "active",
    currentPeriodEnd: null,
    payload: {
      id: "sub_hostvia",
      status: "scheduled_cancel",
      customer: { id: "cust_hostvia" },
      product: { id: "prod_hostvia_pro" },
      current_period_end_date: "2026-11-23T00:00:00.000Z",
      updated_at: "2026-10-23T13:00:00.000Z",
    },
  });

  assert.ok(update);
  assert.equal(update.subscriptionStatus, "active");
  assert.equal(update.cancelAtPeriodEnd, true);
  assert.equal(update.currentPeriodEnd, "2026-11-23T00:00:00.000Z");
  assert.equal(
    hasProAccess({
      subscription_status: update.subscriptionStatus,
      subscription_current_period_end: update.currentPeriodEnd,
      subscription_cancel_at_period_end: update.cancelAtPeriodEnd,
      pro_access_granted: false,
    }),
    true
  );
});

test("a cancel click does not downgrade when Creem has not scheduled the period end", () => {
  const update = confirmScheduledCancellation({
    expectedSubscriptionId: "sub_hostvia",
    expectedCustomerId: "cust_hostvia",
    expectedProductId: "prod_hostvia_pro",
    currentStatus: "active",
    currentPeriodEnd: "2026-11-23T00:00:00.000Z",
    payload: {
      id: "sub_hostvia",
      status: "canceled",
      customer: "cust_hostvia",
      product: "prod_hostvia_pro",
      current_period_end_date: "2026-10-23T13:00:00.000Z",
      updated_at: "2026-10-23T13:00:00.000Z",
    },
  });

  assert.equal(update, null);
});

test("resume restores an active subscription and clears the scheduled cancellation", () => {
  const update = confirmResumedSubscription({
    expectedSubscriptionId: "sub_hostvia",
    expectedCustomerId: "cust_hostvia",
    expectedProductId: "prod_hostvia_pro",
    currentPeriodEnd: "2026-11-23T00:00:00.000Z",
    payload: {
      id: "sub_hostvia",
      status: "active",
      customer: { id: "cust_hostvia" },
      product: { id: "prod_hostvia_pro" },
      current_period_end_date: "2026-11-23T00:00:00.000Z",
      updated_at: "2026-10-23T14:00:00.000Z",
    },
  });

  assert.ok(update);
  assert.equal(update.subscriptionStatus, "active");
  assert.equal(update.cancelAtPeriodEnd, false);
});

function decisionStatus(decision: CreemBillingAuthDecision): number | null {
  return decision.ok ? null : decision.status;
}

test("resume does not apply a mismatched subscription or a non-active status", () => {
  const mismatched = confirmResumedSubscription({
    expectedSubscriptionId: "sub_hostvia",
    expectedCustomerId: "cust_hostvia",
    expectedProductId: "prod_hostvia_pro",
    currentPeriodEnd: null,
    payload: {
      id: "sub_other",
      status: "active",
      customer: "cust_hostvia",
      product: "prod_hostvia_pro",
    },
  });
  const canceled = confirmResumedSubscription({
    expectedSubscriptionId: "sub_hostvia",
    expectedCustomerId: "cust_hostvia",
    expectedProductId: "prod_hostvia_pro",
    currentPeriodEnd: null,
    payload: {
      id: "sub_hostvia",
      status: "canceled",
      customer: "cust_hostvia",
      product: "prod_hostvia_pro",
    },
  });

  assert.equal(mismatched, null);
  assert.equal(canceled, null);
});
