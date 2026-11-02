import assert from "node:assert/strict";
import test from "node:test";
import {
  getBrowserPublicOrigin,
  isGoogleTranslateProxyHost,
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

test("getBrowserPublicOrigin never returns a translate.goog origin", () => {
  const proxyHost = "petra--matakova-hostvia-me.translate.goog";
  const origin = getBrowserPublicOrigin(
    proxyHost,
    `https://${proxyHost}`
  );

  assert.equal(origin.includes("translate.goog"), false);
  assert.match(origin, /^https?:\/\//);
});

test("getBrowserPublicOrigin keeps real Hostvia origins", () => {
  assert.equal(
    getBrowserPublicOrigin(
      "fairy-tale.hostvia.me",
      "https://fairy-tale.hostvia.me"
    ),
    "https://fairy-tale.hostvia.me"
  );
  assert.equal(
    getBrowserPublicOrigin("hostvia.me", "https://hostvia.me"),
    "https://hostvia.me"
  );
});
