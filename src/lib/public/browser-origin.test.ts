import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeGoogleTranslateProxyHost,
  getBrowserPublicOrigin,
  getPublicApiOrigin,
  isAllowedHostviaHostname,
  isAllowedPublicApiBrowserOrigin,
  isGoogleTranslateProxyHost,
  resolvePublicApiUrl,
} from "@/lib/public/browser-origin";

test("isGoogleTranslateProxyHost detects translate.goog hosts", () => {
  assert.equal(
    isGoogleTranslateProxyHost("petra--matakova-hostvia-me.translate.goog"),
    true
  );
  assert.equal(isGoogleTranslateProxyHost("translate.goog"), true);
  assert.equal(
    isGoogleTranslateProxyHost("petra-matakova.hostvia.me"),
    false
  );
  assert.equal(isGoogleTranslateProxyHost("hostvia.me"), false);
  assert.equal(isGoogleTranslateProxyHost("localhost"), false);
});

test("decodeGoogleTranslateProxyHost reverses Google host encoding", () => {
  assert.equal(
    decodeGoogleTranslateProxyHost(
      "petra--matakova-hostvia-me.translate.goog"
    ),
    "petra-matakova.hostvia.me"
  );
  assert.equal(
    decodeGoogleTranslateProxyHost("hostvia-me.translate.goog"),
    "hostvia.me"
  );
  assert.equal(
    decodeGoogleTranslateProxyHost("fairy--tale-hostvia-me.translate.goog"),
    "fairy-tale.hostvia.me"
  );
  assert.equal(decodeGoogleTranslateProxyHost("hostvia.me"), null);
  assert.equal(decodeGoogleTranslateProxyHost("evil.example.translate.goog"), null);
});

test("isAllowedHostviaHostname accepts only Hostvia hosts", () => {
  assert.equal(isAllowedHostviaHostname("hostvia.me"), true);
  assert.equal(isAllowedHostviaHostname("www.hostvia.me"), true);
  assert.equal(isAllowedHostviaHostname("fairy-tale.hostvia.me"), true);
  assert.equal(isAllowedHostviaHostname("evil.example.com"), false);
  assert.equal(
    isAllowedHostviaHostname("petra-matakova.hostvia.me.evil.com"),
    false
  );
});

test("getBrowserPublicOrigin decodes translate.goog to the real booking host", () => {
  const proxyHost = "petra--matakova-hostvia-me.translate.goog";
  assert.equal(
    getBrowserPublicOrigin(proxyHost, `https://${proxyHost}`),
    "https://petra-matakova.hostvia.me"
  );
  assert.equal(
    getBrowserPublicOrigin(
      "fairy-tale.hostvia.me",
      "https://fairy-tale.hostvia.me"
    ),
    "https://fairy-tale.hostvia.me"
  );
});

test("resolvePublicApiUrl stays relative off the Translate proxy", () => {
  assert.equal(
    resolvePublicApiUrl("/api/booking-requests", "fairy-tale.hostvia.me"),
    "/api/booking-requests"
  );
  assert.equal(
    resolvePublicApiUrl("/api/booking-requests", "hostvia.me"),
    "/api/booking-requests"
  );
});

test("resolvePublicApiUrl uses the real Hostvia origin on translate.goog", () => {
  assert.equal(
    resolvePublicApiUrl(
      "/api/booking-requests",
      "petra--matakova-hostvia-me.translate.goog"
    ),
    "https://petra-matakova.hostvia.me/api/booking-requests"
  );
  assert.equal(
    getPublicApiOrigin("petra--matakova-hostvia-me.translate.goog"),
    "https://petra-matakova.hostvia.me"
  );
  assert.equal(getPublicApiOrigin("fairy-tale.hostvia.me"), "");
});

test("isAllowedPublicApiBrowserOrigin allows Translate proxy for Hostvia hosts", () => {
  assert.equal(
    isAllowedPublicApiBrowserOrigin(
      "https://petra--matakova-hostvia-me.translate.goog"
    ),
    true
  );
  assert.equal(
    isAllowedPublicApiBrowserOrigin("https://fairy-tale.hostvia.me"),
    true
  );
  assert.equal(
    isAllowedPublicApiBrowserOrigin("https://evil-example-com.translate.goog"),
    false
  );
  assert.equal(
    isAllowedPublicApiBrowserOrigin("https://evil.example.com"),
    false
  );
});
