import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addPage,
  addSection,
  prepareNewDocument,
  reorderSections,
  switchTheme,
  updatePage,
} from "@/lib/website-builder/document-ops";
import { chooseDraft, isDraftToken, newDraftToken } from "@/lib/website-builder/draft-store";
import { decideClaim, nextWebsitePublication, resolvePublicExperience } from "@/lib/website-builder/claim";
import { mergeStays } from "@/lib/website-builder/merge-properties";
import { findEquivalentProperties, validateImportDecisions } from "@/lib/website-builder/property-match";
import { cleanImageUrl, cleanText, countDocumentImages, sanitizeDocument } from "@/lib/website-builder/sanitize";
import { buildWebsiteMetadata, canonicalFor, indexableRobots, resolvedSeoTitle, websiteSitemapPaths } from "@/lib/website-builder/seo";
import { bookingInquiryPayload, stayRangeAvailability, unavailableNightKeys } from "@/lib/website-builder/booking";
import { mergeWebsiteModel } from "@/lib/website-builder/merge-properties";
import type { LivePropertySnapshot, WebsiteDocument } from "@/lib/website-builder/types";

const property: LivePropertySnapshot = {
  id: "prop-1",
  slug: "olive-house",
  name: "Olive House",
  shortDescription: "A stone house",
  description: "Live description from Hostvia",
  address: "Hvar",
  imageUrl: "https://cdn.example.com/cover.jpg",
  galleryUrls: ["https://cdn.example.com/room.jpg"],
  capacity: 6,
  amenities: ["Pool", "Kitchen"],
  startingPrice: 240,
  currencyCode: "EUR",
};

describe("anonymous website drafts", () => {
  it("creates a multi-page site without an account", () => {
    const document = prepareNewDocument("coastal");
    assert.equal(document.theme, "coastal");
    assert.ok(document.pages.length >= 8);
    assert.equal(document.pages.some((page) => page.isHome), true);
  });

  it("recovers the newer draft and keeps a server copy when it is newer", () => {
    const local = prepareNewDocument("luxe");
    const server = switchTheme(local, "nature");
    const chosen = chooseDraft(
      { document: local, updatedAt: "2026-01-01T00:00:00.000Z" },
      { document: server, updatedAt: "2026-02-01T00:00:00.000Z" }
    );
    assert.equal(chosen?.document.theme, "nature");
  });

  it("issues an unguessable draft token", () => {
    const token = newDraftToken();
    assert.equal(isDraftToken(token), true);
    assert.equal(isDraftToken("short"), false);
  });
});

describe("website editing", () => {
  it("switches theme without dropping the property name", () => {
    const start = prepareNewDocument("luxe");
    start.profile.name = "Casa Mare";
    const next = switchTheme(sanitizeDocument(start), "minimal");
    assert.equal(next.theme, "minimal");
    assert.equal(next.profile.name, "Casa Mare");
    assert.equal(next.design.paletteId, "paper");
  });

  it("adds, renames and keeps a single homepage", () => {
    const start = prepareNewDocument("escape");
    const withPage = addPage(start, { title: "Weddings" });
    const created = withPage.pages.find((page) => page.title === "Weddings");
    assert.ok(created);
    const renamed = updatePage(withPage, created!.id, { title: "Celebrations", slug: "celebrations" });
    const page = renamed.pages.find((item) => item.id === created!.id);
    assert.equal(page?.slug, "celebrations");
    assert.equal(renamed.pages.filter((item) => item.isHome).length, 1);
  });

  it("reorders sections", () => {
    const start = prepareNewDocument("nature");
    const home = start.pages.find((page) => page.isHome)!;
    const before = home.sections.map((section) => section.id);
    const next = reorderSections(start, home.id, 0, 2);
    const after = next.pages.find((page) => page.isHome)!.sections.map((section) => section.id);
    assert.notDeepEqual(after, before);
    assert.equal(after[2], before[0]);
  });

  it("adds a section type from the library", () => {
    const start = prepareNewDocument("luxe");
    const home = start.pages.find((page) => page.isHome)!;
    const next = addSection(start, home.id, "faq");
    assert.equal(next.pages.find((page) => page.isHome)!.sections.at(-1)?.type, "faq");
  });
});

describe("security and uploads", () => {
  it("strips html and rejects unsafe image urls", () => {
    assert.equal(cleanText("<script>alert(1)</script>Hello", 40), "alert(1)Hello");
    assert.equal(cleanImageUrl("javascript:alert(1)"), "");
    assert.equal(cleanImageUrl("https://cdn.example.com/photo.svg"), "");
    assert.equal(cleanImageUrl("https://cdn.example.com/photo.jpg"), "https://cdn.example.com/photo.jpg");
  });

  it("counts images against the draft limit", () => {
    const document = prepareNewDocument("luxe");
    document.gallery = [{ url: "https://cdn.example.com/a.jpg", alt: "A" }];
    assert.equal(countDocumentImages(sanitizeDocument(document)) >= 1, true);
  });
});

describe("claiming and property import", () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const project = { claimedBy: null, websiteId: null, expiresAt: future };

  it("creates a website for a new account and is idempotent after claim", () => {
    assert.deepEqual(
      decideClaim({ token: "a".repeat(64), userId: "user-1", project, existingWebsiteId: null }),
      { ok: true, action: "create", websiteId: null }
    );
    assert.equal(
      decideClaim({
        token: "a".repeat(64),
        userId: "user-1",
        project: { claimedBy: "user-1", websiteId: "site-1", expiresAt: future },
        existingWebsiteId: "site-1",
      }).ok,
      true
    );
  });

  it("rejects another user's project and a second website", () => {
    const stolen = decideClaim({
      token: "b".repeat(64),
      userId: "user-2",
      project: { claimedBy: "user-1", websiteId: "site-1", expiresAt: future },
      existingWebsiteId: null,
    });
    assert.equal(stolen.ok, false);
    if (!stolen.ok) assert.equal(stolen.error, "claimed_by_other");

    const duplicate = decideClaim({
      token: "c".repeat(64),
      userId: "user-1",
      project,
      existingWebsiteId: "site-9",
    });
    assert.equal(duplicate.ok, false);
    if (!duplicate.ok) assert.equal(duplicate.error, "account_has_website");
  });

  it("requires an explicit choice when a property name already exists", () => {
    const matches = findEquivalentProperties("Olive House", [{ id: "prop-1", name: " olive   house " }]);
    assert.equal(matches.length, 1);
    const blocked = validateImportDecisions({
      decisions: [{ accommodationId: "stay-1", action: "create", acknowledgeDuplicate: false }],
      accommodations: [{ id: "stay-1", name: "Olive House", propertyId: null }],
      properties: [{ id: "prop-1", name: "Olive House" }],
    });
    assert.equal(blocked.ok, false);
    const linked = validateImportDecisions({
      decisions: [{ accommodationId: "stay-1", action: "link", propertyId: "prop-1" }],
      accommodations: [{ id: "stay-1", name: "Olive House", propertyId: null }],
      properties: [{ id: "prop-1", name: "Olive House" }],
    });
    assert.equal(linked.ok, true);
  });
});

describe("property sync, currency and booking", () => {
  it("uses the live price and currency while keeping a custom introduction", () => {
    const document = prepareNewDocument("luxe");
    document.accommodations = [{
      id: "stay-1",
      propertyId: "prop-1",
      kind: "villa",
      name: "Marketing name",
      summary: "Website introduction",
      description: "Should not replace the live description",
      location: "Draft location",
      capacity: 2,
      pricePerNight: 10,
      currencyCode: "USD",
      amenities: ["Draft amenity"],
      photos: [],
      usePropertyName: true,
      usePropertyDescription: true,
      usePropertyPhotos: true,
      usePropertyAmenities: true,
      usePropertyLocation: true,
    }];
    const [stay] = mergeStays(sanitizeDocument(document), [property]);
    assert.equal(stay.name, "Olive House");
    assert.equal(stay.summary, "Website introduction");
    assert.equal(stay.description, "Live description from Hostvia");
    assert.equal(stay.pricePerNight, 240);
    assert.equal(stay.currencyCode, "EUR");
    assert.equal(stay.capacity, 6);
    assert.deepEqual(stay.amenities, ["Pool", "Kitchen"]);
  });

  it("does not treat an occupied night as available", () => {
    const reservations = [{ check_in: "2026-12-10", check_out: "2026-12-13" }];
    const blocked = stayRangeAvailability(reservations, "2026-12-11", "2026-12-12");
    assert.equal(blocked.available, false);
    assert.deepEqual(unavailableNightKeys(reservations), ["2026-12-10", "2026-12-11", "2026-12-12"]);
  });

  it("builds a booking inquiry for the connected property", () => {
    const payload = bookingInquiryPayload({
      propertySlug: " olive-house ",
      guestName: " Ada ",
      email: "ada@example.com",
      phone: "+385 1",
      checkIn: "2026-12-01",
      checkOut: "2026-12-04",
      guestCount: 2,
      message: "  ",
    });
    assert.equal(payload.propertySlug, "olive-house");
    assert.equal(payload.message, null);
    assert.equal(payload.guestName, "Ada");
  });
});

describe("publishing and SEO", () => {
  it("publishes and unpublishes without switching away from the full website", () => {
    assert.deepEqual(nextWebsitePublication("publish"), { status: "published", publicSiteMode: "website" });
    assert.deepEqual(nextWebsitePublication("unpublish"), { status: "unpublished", publicSiteMode: "website" });
    assert.equal(resolvePublicExperience({ mode: "booking", hostPublished: true, websiteStatus: null }), "booking");
    assert.equal(resolvePublicExperience({ mode: "website", hostPublished: true, websiteStatus: "unpublished" }), "offline");
    assert.equal(resolvePublicExperience({ mode: "website", hostPublished: true, websiteStatus: "published" }), "website");
  });

  it("builds indexable metadata, canonicals and a sitemap from enabled pages", () => {
    const document: WebsiteDocument = sanitizeDocument(prepareNewDocument("escape"));
    document.profile.name = "Olive House";
    const home = document.pages.find((page) => page.isHome)!;
    home.seo = { ...home.seo, title: "Olive House", description: "A private house on Hvar." };
    const hidden = document.pages.find((page) => page.type === "faq")!;
    hidden.enabled = false;
    hidden.seo.noindex = true;
    const model = mergeWebsiteModel({
      document: sanitizeDocument(document),
      properties: [],
      username: "olive-house",
      page: home,
      pro: false,
    });
    const metadata = buildWebsiteMetadata(model);
    assert.equal(metadata.description, "A private house on Hvar.");
    assert.equal(canonicalFor("olive-house", home).endsWith("olive-house") || canonicalFor("olive-house", home).includes("/host/olive-house"), true);
    assert.deepEqual(indexableRobots({ ...hidden, seo: { ...hidden.seo, noindex: true } }, false), { index: true, follow: true });
    assert.deepEqual(indexableRobots({ ...hidden, seo: { ...hidden.seo, noindex: true } }, true), { index: false, follow: false });
    const paths = websiteSitemapPaths(model.pages);
    assert.equal(paths.includes("/"), true);
    assert.equal(paths.includes("/faq"), false);
  });

  it("fills a search title from the property name and location", () => {
    const document: WebsiteDocument = sanitizeDocument(prepareNewDocument("luxe"));
    document.profile.name = "Olive House";
    document.profile.location = "Hvar, Croatia";
    const home = document.pages.find((page) => page.isHome)!;
    const model = mergeWebsiteModel({
      document: sanitizeDocument(document),
      properties: [],
      username: "olive-house",
      page: home,
      pro: false,
    });
    assert.equal(resolvedSeoTitle(model), "Olive House in Hvar, Croatia");
    const metadata = buildWebsiteMetadata(model);
    assert.equal(metadata.title && typeof metadata.title === "object" && "absolute" in metadata.title ? metadata.title.absolute : "", "Olive House in Hvar, Croatia");
    assert.match(String(metadata.description), /Hvar, Croatia|private house/);
  });
});
