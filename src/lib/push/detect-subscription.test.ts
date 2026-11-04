import assert from "node:assert/strict";
import test from "node:test";
import {
  detectPushSubscription,
  matchingStoredUserAgents,
} from "@/lib/push/detect-subscription";

const base = {
  supported: true,
  vapidReady: true,
  permission: "granted" as const,
  serviceWorkerReady: true,
  browserSubscribed: false,
  rememberedOn: false,
  optedOut: false,
};

test("a browser subscription wins over a stale opt-out", () => {
  assert.equal(
    detectPushSubscription({
      ...base,
      browserSubscribed: true,
      optedOut: true,
    }),
    "subscribed"
  );
});

test("iOS can hide the subscription while this device is still registered", () => {
  assert.equal(
    detectPushSubscription({
      ...base,
      permission: "granted",
      rememberedOn: true,
    }),
    "subscribed"
  );
});

test("a saved device stays on when permission cannot be read yet", () => {
  assert.equal(
    detectPushSubscription({
      ...base,
      permission: "default",
      rememberedOn: true,
    }),
    "subscribed"
  );
});

test("granted permission without a device record stays ready", () => {
  assert.equal(detectPushSubscription(base), "ready");
});

test("an explicit opt-out stays off even if the server row is still there", () => {
  assert.equal(
    detectPushSubscription({
      ...base,
      rememberedOn: true,
      optedOut: true,
    }),
    "ready"
  );
});

test("an iOS version change still matches the only saved iPhone", () => {
  const stored =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Version/18.1 Mobile/15E148 Safari/604.1";
  const current =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 Version/18.2 Mobile/15E148 Safari/604.1";

  assert.deepEqual(matchingStoredUserAgents([stored], current), [stored]);
});

test("two saved iPhones are not treated as this phone without an exact match", () => {
  const first = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X)";
  const second = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X)";
  const current = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X)";

  assert.deepEqual(matchingStoredUserAgents([first, second], current), []);
  assert.deepEqual(matchingStoredUserAgents([first, current], current), [current]);
});

test("a desktop subscription does not mark the phone as on", () => {
  assert.deepEqual(
    matchingStoredUserAgents(
      ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"],
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X)"
    ),
    []
  );
});

test("denied permission is not treated as subscribed", () => {
  assert.equal(
    detectPushSubscription({
      ...base,
      permission: "denied",
      rememberedOn: true,
    }),
    "denied"
  );
});
