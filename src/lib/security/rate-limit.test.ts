import assert from "node:assert/strict";
import test from "node:test";
import {
  GUEST_CANCEL_LIMIT,
  hashClientIp,
  rateLimitDecision,
} from "@/lib/security/rate-limit";

test("public cancellation is rate limited without storing the raw IP", () => {
  const hash = hashClientIp("203.0.113.10");
  assert.equal(hash.includes("203.0.113.10"), false);
  assert.equal(hash.length, 64);
  assert.equal(rateLimitDecision(GUEST_CANCEL_LIMIT - 1, GUEST_CANCEL_LIMIT), "allow");
  assert.equal(rateLimitDecision(GUEST_CANCEL_LIMIT, GUEST_CANCEL_LIMIT), "deny");
  assert.equal(rateLimitDecision(0, 0), "deny");
});
