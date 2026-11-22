import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateBotGuard,
  FORM_STARTED_FIELD,
  HONEYPOT_FIELD,
  looksLikeLinkSpam,
  MIN_FORM_FILL_MS,
} from "./bot-guard";

const now = 1_800_000_000_000;

test("filled honeypot is a bot", () => {
  assert.equal(evaluateBotGuard({ [HONEYPOT_FIELD]: "http://spam" }, now), "honeypot");
});

test("empty honeypot and human timing passes", () => {
  assert.equal(
    evaluateBotGuard({ [HONEYPOT_FIELD]: "", [FORM_STARTED_FIELD]: now - 20_000 }, now),
    "ok"
  );
});

test("instant submission is too fast", () => {
  assert.equal(
    evaluateBotGuard({ [FORM_STARTED_FIELD]: now - (MIN_FORM_FILL_MS - 1) }, now),
    "too_fast"
  );
});

test("missing or bogus timestamp does not block", () => {
  assert.equal(evaluateBotGuard({}, now), "ok");
  assert.equal(evaluateBotGuard({ [FORM_STARTED_FIELD]: "abc" }, now), "ok");
  assert.equal(evaluateBotGuard({ [FORM_STARTED_FIELD]: now + 60_000 }, now), "ok");
});

test("link spam detection", () => {
  assert.equal(looksLikeLinkSpam("Arriving at 5pm, see you"), false);
  assert.equal(looksLikeLinkSpam("our site www.example.com"), false);
  assert.equal(
    looksLikeLinkSpam("http://a.io http://b.io https://c.io buy now"),
    true
  );
});
