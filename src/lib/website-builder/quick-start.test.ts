import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyQuickStart,
  parseQuickStartResult,
  QUICK_START_SCHEMA,
  tidyListingText,
} from "@/lib/website-builder/ai/quick-start";
import { addAccommodation, prepareNewDocument, updateAccommodation } from "@/lib/website-builder/document-ops";
import { mergeStays, mergeWebsiteModel } from "@/lib/website-builder/merge-properties";
import { sampleWebsiteModel } from "@/lib/website-builder/sample-site";

const copy = (title: string, body = `${title} body.`) => ({ eyebrow: "Eyebrow", title, body });

function rawResult(overrides: Record<string, unknown> = {}) {
  return {
    language: "sr",
    property: { name: "Vila Panorama", type: "Private villa", location: "Budva, Montenegro", shortDescription: "A stone villa above the bay." },
    home: {
      hero: { ...copy("Above the bay"), ctaLabel: "Ask for dates" },
      welcome: copy("Welcome home"),
      story: copy("Mornings on the terrace"),
      featured: copy("Your stay"),
      amenities: { ...copy("In the house"), items: ["Pool", "Sea view", "Wi-Fi", "Pool", "Parking", "Air conditioning", "Kitchen"] },
      experiences: { ...copy("How the days go"), items: [{ title: "Morning", body: "A swim." }, { title: "Evening", body: "Dinner outside." }, { title: "", body: "dropped" }] },
      gallery: copy("Inside and out"),
      chapter: { eyebrow: "", title: "Where the day slows down", body: "" },
      cta: { ...copy("Ask about a stay"), ctaLabel: "Check dates" },
    },
    about: { intro: copy("About the villa"), story: copy("How it lives") },
    stays: { hero: copy("Accommodation"), grid: copy("Choose a space") },
    location: copy("Old town, five minutes"),
    faq: [
      { title: "Is this a reservation?", body: "No, the host confirms." },
      { title: "Check-in?", body: "From 3 pm." },
      { title: "Parking?", body: "Free on site." },
    ],
    contact: copy("Write to us"),
    seo: { title: "Vila Panorama · Budva", description: "A stone villa above the bay of Budva." },
    units: [
      { name: "Sea View Apartment", kind: "apartment", capacity: 4, summary: "Two bedrooms and a terrace.", description: "Long description.", amenities: ["Terrace", "Kitchen"], photoIndexes: [2, 9, 2, 1] },
      { name: "Garden Studio", kind: "room", capacity: 2, summary: "A studio by the garden.", description: "", amenities: [], photoIndexes: [] },
    ],
    photos: [
      { index: 0, role: "bedroom", alt: "Bedroom with linen" },
      { index: 1, role: "view", alt: "View over the bay" },
      { index: 2, role: "living", alt: "Living room" },
      { index: 7, role: "other", alt: "out of range" },
    ],
    coverIndex: 1,
    notes: ["Check the parking details."],
    ...overrides,
  };
}

const urls = ["https://cdn.test/0.jpg", "https://cdn.test/1.jpg", "https://cdn.test/2.jpg"];

describe("quick start parsing", () => {
  it("bounds counts, removes duplicates and out-of-range photo references", () => {
    const result = parseQuickStartResult(rawResult(), 3);
    assert.equal(result.language, "sr");
    assert.deepEqual(result.home.amenities.items.filter((item) => item === "Pool").length, 1);
    assert.equal(result.home.experiences.items.length, 2);
    assert.deepEqual(result.units[0].photoIndexes, [2, 1]);
    assert.equal(result.photos.length, 3);
    assert.equal(result.coverIndex, 1);
  });

  it("falls back safely on bad values and rejects empty output", () => {
    const result = parseQuickStartResult(rawResult({ language: "xx", coverIndex: 99, units: [{ kind: "castle", capacity: -3 }] }), 3);
    assert.equal(result.language, "en");
    assert.equal(result.coverIndex, 0);
    assert.equal(result.units[0].kind, "holiday_home");
    assert.equal(result.units[0].capacity, null);
    assert.throws(() => parseQuickStartResult({}, 0));
  });

  it("shortens long text at a sentence or word boundary", () => {
    const long = "This is a sentence. ".repeat(60);
    const result = parseQuickStartResult(rawResult({ property: { name: "X", type: "", location: "", shortDescription: long } }), 0);
    assert.ok(result.property.shortDescription.length <= 220);
    assert.ok(result.property.shortDescription.endsWith("."));
  });

  it("uses a strict schema that the API accepts", () => {
    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      const record = node as Record<string, unknown>;
      if (record.type === "object") {
        assert.equal(record.additionalProperties, false);
        assert.deepEqual([...(record.required as string[])].sort(), Object.keys(record.properties as object).sort());
      }
      for (const value of Object.values(record)) walk(value);
    };
    walk(QUICK_START_SCHEMA);
  });

  it("tidies a select-all copy", () => {
    assert.equal(tidyListingText("  Villa\r\n\r\n\r\n\tPool  view \n\n\nEnd "), "Villa\n\nPool view\n\nEnd");
  });
});

describe("applying a quick start result", () => {
  it("writes copy into every page, profile, SEO and the gallery with the cover first", () => {
    const result = parseQuickStartResult(rawResult(), 3);
    const doc = applyQuickStart(prepareNewDocument("luxe"), result, urls);
    assert.equal(doc.profile.name, "Vila Panorama");
    assert.equal(doc.profile.language, "sr");
    const home = doc.pages.find((page) => page.isHome)!;
    const hero = home.sections.find((section) => section.type === "hero")!;
    assert.equal(hero.settings.title, "Above the bay");
    assert.equal(hero.settings.ctaLabel, "Ask for dates");
    assert.equal(hero.settings.ctaHref, "#booking");
    assert.equal(home.seo.title, "Vila Panorama · Budva");
    const amenities = home.sections.find((section) => section.type === "amenities")!;
    assert.ok(amenities.settings.items.some((item) => item.title === "Sea view"));
    const about = doc.pages.find((page) => page.type === "about")!;
    assert.equal(about.sections[0].settings.title, "About the villa");
    assert.equal(doc.pages.find((page) => page.type === "faq")!.enabled, true);
    assert.equal(doc.gallery[0].url, urls[1]);
    assert.equal(doc.gallery[0].alt, "View over the bay");
  });

  it("creates stays with pages and their own photos, without prices", () => {
    const result = parseQuickStartResult(rawResult(), 3);
    const doc = applyQuickStart(prepareNewDocument("coastal"), result, urls);
    assert.deepEqual(doc.accommodations.map((stay) => stay.name), ["Sea View Apartment", "Garden Studio"]);
    assert.ok(doc.accommodations.every((stay) => stay.pricePerNight === null && stay.propertyId === null));
    assert.deepEqual(doc.accommodations[0].photos.map((photo) => photo.url), [urls[2], urls[1]]);
    assert.equal(doc.accommodations[1].photos.length > 0, true, "falls back to gallery photos");
    const unitPages = doc.pages.filter((page) => page.type === "accommodation_unit");
    assert.equal(unitPages.length, 2);
    assert.equal(unitPages[0].sections[0].settings.body, "Two bedrooms and a terrace.");
  });

  it("keeps stays connected to Hostvia and replaces only unconnected ones", () => {
    let doc = prepareNewDocument("nature");
    doc = addAccommodation(doc, { name: "Linked", kind: "villa" });
    doc = updateAccommodation(doc, doc.accommodations[0].id, { propertyId: "prop-1" });
    doc = addAccommodation(doc, { name: "Old draft", kind: "room" });
    const next = applyQuickStart(doc, parseQuickStartResult(rawResult(), 3), urls);
    const names = next.accommodations.map((stay) => stay.name);
    assert.ok(names.includes("Linked"));
    assert.ok(!names.includes("Old draft"));
    assert.equal(next.pages.filter((page) => page.type === "accommodation_unit").length, next.accommodations.length);
  });

  it("skips failed uploads and keeps the existing gallery when no photo uploaded", () => {
    const result = parseQuickStartResult(rawResult(), 3);
    const partial = applyQuickStart(prepareNewDocument("minimal"), result, [urls[0], null, urls[2]]);
    assert.deepEqual(partial.gallery.map((image) => image.url), [urls[0], urls[2]]);
    const base = { ...prepareNewDocument("minimal"), gallery: [{ url: "https://cdn.test/keep.jpg", alt: "Keep" }] };
    const none = applyQuickStart(base, result, [null, null, null]);
    assert.deepEqual(none.gallery.map((image) => image.url), ["https://cdn.test/keep.jpg"]);
  });
});

describe("stay prices come from Hostvia", () => {
  it("shows no price for stays that are not connected", () => {
    let doc = prepareNewDocument("luxe");
    doc = addAccommodation(doc, { name: "Draft", kind: "villa" });
    doc = updateAccommodation(doc, doc.accommodations[0].id, { pricePerNight: 300 });
    assert.equal(mergeStays(doc, [])[0].pricePerNight, null);
    const home = doc.pages.find((page) => page.isHome)!;
    assert.equal(mergeWebsiteModel({ document: doc, properties: [], username: "x", page: home }).stays[0].pricePerNight, null);
  });

  it("keeps illustrative rates on the demo sites", () => {
    assert.ok(sampleWebsiteModel("luxe").stays.some((stay) => stay.pricePerNight));
  });
});

describe("guided paths", () => {
  it("keeps the AI path to three steps and the manual path to seven", async () => {
    const { STEP, stepsForPath, neighbourStep } = await import("@/components/website-builder/steps");
    assert.deepEqual(stepsForPath("ai"), [STEP.design, STEP.quickStart, STEP.launch]);
    assert.deepEqual(stepsForPath(null), stepsForPath("ai"));
    assert.equal(stepsForPath("manual").length, 7);
    assert.ok(!stepsForPath("manual").includes(STEP.quickStart));
    assert.equal(neighbourStep(null, STEP.design, 1), STEP.quickStart);
    assert.equal(neighbourStep("manual", STEP.design, 1), STEP.place);
    assert.equal(neighbourStep("ai", STEP.quickStart, 1), STEP.launch);
    // A step opened from the launch checklist returns to the path.
    assert.equal(neighbourStep("ai", STEP.photos, 1), STEP.launch);
    assert.equal(neighbourStep("ai", STEP.photos, -1), STEP.quickStart);
    assert.equal(neighbourStep("ai", STEP.launch, 1), null);
  });

  it("stores the chosen path and drops unknown values", async () => {
    const { sanitizeDocument } = await import("@/lib/website-builder/sanitize");
    assert.equal(sanitizeDocument({ ...prepareNewDocument("luxe"), wizardPath: "ai" }).wizardPath, "ai");
    assert.equal(sanitizeDocument({ ...prepareNewDocument("luxe"), wizardPath: "robot" }).wizardPath, null);
    assert.equal(prepareNewDocument("luxe").wizardPath, null);
  });
});
