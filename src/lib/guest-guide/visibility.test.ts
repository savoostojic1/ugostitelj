import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyGuideContent } from "@/lib/guest-guide/defaults";
import {
  sectionHasContent,
  visibleSections,
} from "@/lib/guest-guide/visibility";
import { defaultSectionVisibility } from "@/lib/guest-guide/defaults";

describe("guest guide visibility", () => {
  it("hides empty sections", () => {
    const content = emptyGuideContent();
    assert.equal(sectionHasContent("wifi", content), false);
    content.wifi.networkName = "HomeNet";
    assert.equal(sectionHasContent("wifi", content), true);
  });

  it("respects visibility flags", () => {
    const content = emptyGuideContent();
    content.welcome.propertyName = "Villa";
    const visibility = defaultSectionVisibility();
    visibility.welcome = false;
    assert.deepEqual(
      visibleSections(["welcome", "wifi"], visibility, content),
      []
    );
  });
});
