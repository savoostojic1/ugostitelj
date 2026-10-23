import assert from "node:assert/strict";
import test from "node:test";
import { authorizeCreemCheckout } from "./authorize-checkout";
import { buildCreemCheckoutBody } from "./checkout-request";
import { resolveCreemApiBaseUrl } from "./config";

const owner = {
  userId: "8d8b6c2e-4f1a-4a7e-9c1d-6b2a9f0e1c11",
  email: "owner@example.com",
  isOwner: true,
  productIdConfigured: true,
  apiKeyConfigured: true,
};

test("checkout allows only a configured, authenticated owner", () => {
  assert.deepEqual(authorizeCreemCheckout(owner), { ok: true });

  const cases = [
    authorizeCreemCheckout({ ...owner, userId: null }),
    authorizeCreemCheckout({ ...owner, email: null }),
    authorizeCreemCheckout({ ...owner, isOwner: false }),
    authorizeCreemCheckout({ ...owner, productIdConfigured: false }),
    authorizeCreemCheckout({ ...owner, apiKeyConfigured: false }),
  ];
  assert.deepEqual(
    cases.map((decision) => (decision.ok ? null : decision.status)),
    [401, 401, 403, 503, 503]
  );
});

test("checkout request uses the server product id and owner metadata", () => {
  const body = buildCreemCheckoutBody({
    productId: "prod_hostvia_pro",
    requestId: "hostvia_req_1",
    successUrl: "https://www.hostvia.me/dashboard/billing?checkout=return",
    hostId: owner.userId!,
    email: owner.email!,
  });

  assert.equal(body.product_id, "prod_hostvia_pro");
  assert.equal(body.metadata.userId, owner.userId);
  assert.equal(body.metadata.appId, "hostvia");
  assert.deepEqual(body.customer, { email: "owner@example.com" });
  assert.equal("custom_price" in body, false);
  assert.equal(body.success_url.includes("session_id"), false);
  assert.equal(body.success_url.includes("checkout=return"), true);
});

test("an existing Creem customer is sent by id, not by a caller-supplied price", () => {
  const body = buildCreemCheckoutBody({
    productId: "prod_hostvia_pro",
    requestId: "hostvia_req_2",
    successUrl: "https://www.hostvia.me/dashboard/billing?checkout=return",
    hostId: owner.userId!,
    email: owner.email!,
    creemCustomerId: "cust_existing",
  });

  assert.deepEqual(body.customer, { id: "cust_existing" });
  assert.equal("email" in body.customer, false);
});

test("Creem base URL is limited to the documented hosts", () => {
  assert.equal(resolveCreemApiBaseUrl(undefined), "https://api.creem.io");
  assert.equal(
    resolveCreemApiBaseUrl("https://test-api.creem.io/"),
    "https://test-api.creem.io"
  );
  assert.throws(() => resolveCreemApiBaseUrl("https://example.com"));
});
