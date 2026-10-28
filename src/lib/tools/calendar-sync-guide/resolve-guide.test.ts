import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PLATFORM_IDS } from "./platforms";
import {
  pairValidationMessage,
  resolveGuide,
  validatePair,
} from "./resolve-guide";

describe("validatePair", () => {
  it("requires both platforms", () => {
    assert.equal(validatePair(null, "booking"), "missing_from");
    assert.equal(validatePair("airbnb", null), "missing_to");
  });

  it("rejects the same platform on both sides", () => {
    assert.equal(validatePair("airbnb", "airbnb"), "same_platform");
    assert.match(pairValidationMessage("same_platform"), /different/i);
  });

  it("accepts distinct supported platforms", () => {
    assert.equal(validatePair("airbnb", "booking"), null);
    assert.equal(validatePair("vrbo", "google"), null);
    assert.equal(validatePair("other", "airbnb"), null);
  });
});

describe("resolveGuide", () => {
  it("builds a short Airbnb → Booking.com action guide", () => {
    const guide = resolveGuide({ from: "airbnb", to: "booking" });
    assert.match(guide.title, /Airbnb/);
    assert.match(guide.title, /Booking\.com/);
    assert.match(guide.directionNote, /one-way/i);
    assert.ok(guide.reverseNote);
    assert.equal(guide.steps.length, 4);
    assert.match(guide.steps[0].title, /Airbnb/i);
    assert.match(guide.steps[1].confirmLabel, /copied/i);
    assert.match(guide.steps[2].title, /Booking\.com/i);
    assert.equal(guide.steps[3].confirmLabel, "Finish");
    assert.ok(guide.steps[0].links?.some((l) => l.kind === "open_platform"));
    assert.ok(guide.officialLinks.some((l) => l.url.includes("airbnb.com")));
    assert.ok(guide.officialLinks.some((l) => l.url.includes("booking.com")));
  });

  it("keeps steps short and actionable", () => {
    const guide = resolveGuide({ from: "airbnb", to: "booking" });
    for (const step of guide.steps) {
      assert.ok(step.title.length < 80, step.title);
      assert.ok(step.body.length < 220, step.body);
      assert.ok(step.confirmLabel.length > 0);
    }
  });

  it("marks other-platform pairs as needing confirmation", () => {
    const guide = resolveGuide({ from: "other", to: "vrbo" });
    assert.equal(guide.needsConfirmation, true);
    assert.ok(guide.warnings.length > 0);
  });

  it("warns when Google is the export source", () => {
    const guide = resolveGuide({ from: "google", to: "airbnb" });
    assert.ok(guide.warnings.some((w) => /public/i.test(w)));
  });

  it("handles every distinct platform pair with few steps", () => {
    for (const from of PLATFORM_IDS) {
      for (const to of PLATFORM_IDS) {
        if (from === to) continue;
        const guide = resolveGuide({ from, to });
        assert.equal(guide.from, from);
        assert.equal(guide.to, to);
        assert.ok(guide.steps.length >= 3 && guide.steps.length <= 5);
        assert.ok(guide.completionChecklist.length >= 4);
        assert.ok(guide.limitationNotes.length > 0);
      }
    }
  });

  it("never asks users to submit an iCal URL to Hostvia", () => {
    const guide = resolveGuide({ from: "booking", to: "vrbo" });
    const blob = JSON.stringify(guide);
    assert.doesNotMatch(blob, /paste (your |the |this )?ical .{0,30}into Hostvia/i);
    assert.match(blob, /[Dd]o not paste it into Hostvia/);
  });
});
