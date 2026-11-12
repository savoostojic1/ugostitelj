import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addAccommodation, prepareNewDocument, updateAccommodation } from "@/lib/website-builder/document-ops";
import { mergeStays } from "@/lib/website-builder/merge-properties";
import { kindForName, rowsToProperties, syncStaysWithProperties } from "@/lib/website-builder/property-stays";
import type { LivePropertySnapshot } from "@/lib/website-builder/types";

function property(id: string, name: string, extra: Partial<LivePropertySnapshot> = {}): LivePropertySnapshot {
  return {
    id,
    slug: id,
    name,
    shortDescription: `${name} in short.`,
    description: `${name} described.`,
    address: "Budva",
    imageUrl: `https://cdn.test/${id}.jpg`,
    galleryUrls: [],
    capacity: 4,
    amenities: ["Wi-Fi"],
    startingPrice: 120,
    currencyCode: "EUR",
    isPublic: true,
    ...extra,
  };
}

const villa = property("prop-1", "Villa Olea");
const studio = property("prop-2", "Garden Studio Apartment");
const hidden = property("prop-3", "Owner flat", { isPublic: false });

describe("website stays follow Hostvia properties", () => {
  it("adds one stay and page per public property, in the host's order", () => {
    const doc = syncStaysWithProperties(prepareNewDocument("luxe"), [villa, hidden, studio]);
    assert.deepEqual(doc.accommodations.map((stay) => stay.propertyId), ["prop-1", "prop-2"]);
    assert.deepEqual(doc.accommodations.map((stay) => stay.kind), ["villa", "apartment"]);
    const units = doc.pages.filter((page) => page.type === "accommodation_unit");
    assert.equal(units.length, 2);
    assert.equal(units[0].sections[0].settings.body, "Villa Olea in short.");
  });

  it("drops stays typed by hand or written by AI, keeps the host's wording", () => {
    let doc = prepareNewDocument("coastal");
    doc = addAccommodation(doc, { name: "Holiday Home with Large Double Bed", kind: "holiday_home" });
    doc = addAccommodation(doc, { name: "Linked", kind: "cabin" });
    doc = updateAccommodation(doc, doc.accommodations[1].id, { propertyId: "prop-1", summary: "My words" });
    const synced = syncStaysWithProperties(doc, [villa]);
    assert.equal(synced.accommodations.length, 1);
    assert.equal(synced.accommodations[0].summary, "My words");
    assert.equal(synced.accommodations[0].kind, "cabin");
    assert.equal(synced.pages.filter((page) => page.type === "accommodation_unit").length, 1);
  });

  it("returns the same document when nothing changes", () => {
    const doc = syncStaysWithProperties(prepareNewDocument("luxe"), [villa]);
    assert.equal(syncStaysWithProperties(doc, [villa]), doc);
    const empty = prepareNewDocument("luxe");
    assert.equal(syncStaysWithProperties(empty, []), empty);
  });

  it("shows every public property live, even one added after the draft was saved", () => {
    const doc = syncStaysWithProperties(prepareNewDocument("luxe"), [villa]);
    const stays = mergeStays(doc, [villa, studio, hidden]);
    assert.deepEqual(stays.map((stay) => stay.name), ["Villa Olea", "Garden Studio Apartment"]);
    assert.ok(stays.every((stay) => stay.pricePerNight === 120 && stay.propertySlug));
    assert.equal(stays[0].photos[0].url, "https://cdn.test/prop-1.jpg");
  });

  it("reads database rows and treats missing is_public as public", () => {
    const rows = rowsToProperties([
      { id: "a", name: "A", starting_price: "90", currency_code: "eur" },
      { id: "b", name: "B", is_public: false },
      { name: "no id" },
    ]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].isPublic, true);
    assert.equal(rows[0].startingPrice, 90);
    assert.equal(rows[1].isPublic, false);
  });

  it("guesses a type from the property name", () => {
    assert.equal(kindForName("Kuća za odmor Ana"), "holiday_home");
    assert.equal(kindForName("Apartman Sunce"), "apartment");
    assert.equal(kindForName("Boutique"), "other");
  });
});
