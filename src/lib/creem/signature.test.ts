import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { creemSignatureHex, verifyCreemWebhookSignature } from "./signature";

const secret = "whsec_test_secret";
const rawBody = JSON.stringify({
  id: "evt_123",
  eventType: "subscription.paid",
});

test("accepts an HMAC-SHA256 hex signature of the raw body", () => {
  const signature = creemSignatureHex(rawBody, secret);
  assert.equal(signature, createHmac("sha256", secret).update(rawBody).digest("hex"));
  assert.equal(verifyCreemWebhookSignature(rawBody, signature, secret), true);
});

test("rejects a tampered body, a short signature, and a missing secret", () => {
  const signature = creemSignatureHex(rawBody, secret);
  assert.equal(verifyCreemWebhookSignature(`${rawBody} `, signature, secret), false);
  assert.equal(verifyCreemWebhookSignature(rawBody, "abcd", secret), false);
  assert.equal(verifyCreemWebhookSignature(rawBody, signature, ""), false);
  assert.equal(verifyCreemWebhookSignature(rawBody, null, secret), false);
});
