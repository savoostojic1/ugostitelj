import assert from "node:assert/strict";
import test from "node:test";
import { buildPropertyExportUrl, parseExportToken } from "@/lib/calendar/export-url";
import { getBrowserPublicOrigin } from "@/lib/public/browser-origin";

test("parseExportToken accepts UUID tokens with optional .ics", () => {
  const token = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  assert.equal(parseExportToken(token), token);
  assert.equal(parseExportToken(`${token}.ics`), token);
  assert.equal(parseExportToken("not-a-token"), null);
});

test("buildPropertyExportUrl uses the provided origin", () => {
  const token = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  assert.equal(
    buildPropertyExportUrl(token, "https://hostvia.me"),
    `https://hostvia.me/api/calendar/${token}.ics`
  );
});

test("calendar export origin helpers never prefer translate.goog", () => {
  const origin = getBrowserPublicOrigin(
    "petra--matakova-hostvia-me.translate.goog",
    "https://petra--matakova-hostvia-me.translate.goog"
  );
  assert.equal(origin.includes("translate.goog"), false);

  const token = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  assert.equal(
    buildPropertyExportUrl(token, origin).includes("translate.goog"),
    false
  );
});
