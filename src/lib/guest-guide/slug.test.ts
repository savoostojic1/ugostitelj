import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isValidGuideSlug,
  slugifyGuideTitle,
  withSlugSuffix,
} from "@/lib/guest-guide/slug";

describe("guest guide slug helpers", () => {
  it("slugifies titles", () => {
    assert.equal(slugifyGuideTitle("Villa Oliva"), "villa-oliva");
    assert.equal(slugifyGuideTitle("  Sea & Sun! "), "sea-sun");
  });

  it("validates slug shape", () => {
    assert.equal(isValidGuideSlug("villa-oliva"), true);
    assert.equal(isValidGuideSlug("Villa"), false);
    assert.equal(isValidGuideSlug("a"), false);
  });

  it("adds numeric suffixes safely", () => {
    assert.equal(withSlugSuffix("villa", 1), "villa");
    assert.equal(withSlugSuffix("villa", 2), "villa-2");
  });
});
