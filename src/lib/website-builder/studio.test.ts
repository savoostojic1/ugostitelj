import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addGalleryImages,
  addSection,
  duplicateSection,
  prepareNewDocument,
  reorderSections,
  setCoverImage,
  switchTheme,
  updateSection,
  withProfile,
} from "@/lib/website-builder/document-ops";
import { mergeWebsiteModel } from "@/lib/website-builder/merge-properties";
import { starterPhotos } from "@/lib/website-builder/photo-library";
import { sampleDocument } from "@/lib/website-builder/sample-site";
import { sanitizeDocument } from "@/lib/website-builder/sanitize";
import { orderForTheme, paletteStyle, themeMeta } from "@/lib/website-builder/themes";
import { WEBSITE_THEMES } from "@/lib/website-builder/types";

const home = (doc: ReturnType<typeof prepareNewDocument>) => doc.pages.find((page) => page.isHome)!;

describe("theme compositions", () => {
  it("gives each theme its own homepage order", () => {
    const orders = WEBSITE_THEMES.map((theme) => home(prepareNewDocument(theme)).sections.map((section) => section.type).join(","));
    assert.equal(new Set(orders).size, WEBSITE_THEMES.length);
    for (const theme of WEBSITE_THEMES) {
      const types = home(prepareNewDocument(theme)).sections.map((section) => section.type);
      assert.equal(types[0], "hero", `${theme} opens with a hero`);
    }
  });

  it("re-composes the homepage on theme switch until the host arranges it by hand", () => {
    const luxe = prepareNewDocument("luxe");
    const nature = switchTheme(luxe, "nature");
    const expected = orderForTheme(home(luxe).sections, "nature").map((section) => section.type);
    assert.deepEqual(home(nature).sections.map((section) => section.type), expected);

    const arranged = reorderSections(luxe, home(luxe).id, 1, 3);
    assert.equal(arranged.design.customOrder, true);
    const switched = switchTheme(arranged, "minimal");
    assert.deepEqual(
      home(switched).sections.map((section) => section.id),
      home(arranged).sections.map((section) => section.id)
    );
  });

  it("writes palette tokens as CSS variables", () => {
    const style = paletteStyle("coastal", "sand");
    assert.equal(style["--wb-accent"], themeMeta("coastal").palettes.find((p) => p.id === "sand")!.tokens.accent);
    assert.ok(style["--wb-bg"] && style["--wb-deep"]);
  });
});

describe("editor operations", () => {
  it("inserts a section with starter content at a position", () => {
    const doc = prepareNewDocument("luxe");
    const page = home(doc);
    const next = addSection(doc, page.id, "faq", { index: 1, id: "faq-section-1" });
    const inserted = home(next).sections[1];
    assert.equal(inserted.id, "faq-section-1");
    assert.equal(inserted.type, "faq");
    assert.ok(inserted.settings.items.length > 0);
    assert.ok(inserted.settings.title.length > 0);
  });

  it("duplicates a section right after the original with fresh item ids", () => {
    const doc = prepareNewDocument("luxe");
    const page = home(doc);
    const source = page.sections.find((section) => section.type === "experiences")!;
    const { document, sectionId } = duplicateSection(doc, page.id, source.id);
    const sections = home(document).sections;
    const at = sections.findIndex((section) => section.id === source.id);
    assert.equal(sections[at + 1].id, sectionId);
    assert.notEqual(sections[at + 1].settings.items[0].id, source.settings.items[0].id);
  });

  it("keeps a blank list item while the host fills it in", () => {
    const doc = prepareNewDocument("luxe");
    const page = home(doc);
    const faq = addSection(doc, page.id, "faq", { id: "faq-section-2" });
    const target = home(faq).sections.find((section) => section.id === "faq-section-2")!;
    const next = updateSection(faq, page.id, target.id, {
      items: [...target.settings.items, { id: "new-item-1", title: "", body: "" }],
    });
    const items = home(next).sections.find((section) => section.id === target.id)!.settings.items;
    assert.equal(items[items.length - 1].id, "new-item-1");
  });

  it("lets an email be typed, and only publishes a valid one", () => {
    let doc = prepareNewDocument("luxe");
    doc = withProfile(doc, { contactEmail: "stay@" });
    assert.equal(doc.profile.contactEmail, "stay@");
    const model = mergeWebsiteModel({ document: doc, properties: [], username: "x", page: home(doc) });
    assert.equal(model.profile.contactEmail, "");
    doc = withProfile(doc, { contactEmail: "stay@example.com" });
    const valid = mergeWebsiteModel({ document: doc, properties: [], username: "x", page: home(doc) });
    assert.equal(valid.profile.contactEmail, "stay@example.com");
  });

  it("moves a chosen photograph to the cover position without duplicates", () => {
    const photos = starterPhotos("nature");
    let doc = addGalleryImages(prepareNewDocument("nature"), photos);
    doc = addGalleryImages(doc, [photos[0]]);
    assert.equal(doc.gallery.length, photos.length);
    doc = setCoverImage(doc, photos[3].url);
    assert.equal(doc.gallery[0].url, photos[3].url);
    assert.equal(doc.gallery.length, photos.length);
  });
});

describe("sample websites", () => {
  it("builds a complete, valid sample for every theme", () => {
    const names = new Set<string>();
    for (const theme of WEBSITE_THEMES) {
      const doc = sampleDocument(theme);
      assert.deepEqual(sanitizeDocument(doc).pages.length, doc.pages.length);
      assert.equal(doc.theme, theme);
      assert.ok(doc.accommodations.length >= 2);
      assert.ok(doc.accommodations.every((stay) => stay.pricePerNight && stay.photos.length));
      assert.ok(doc.gallery.length >= 6);
      names.add(doc.profile.name);
    }
    assert.equal(names.size, WEBSITE_THEMES.length);
  });
});

describe("typing in the builder", () => {
  it("keeps spaces while a host types word by word", () => {
    let doc = prepareNewDocument("luxe");
    for (const value of ["V", "Villa", "Villa ", "Villa S", "Villa Sea"]) {
      doc = withProfile(doc, { name: value });
    }
    assert.equal(doc.profile.name, "Villa Sea");
    const page = home(doc);
    const hero = page.sections.find((section) => section.type === "hero")!;
    const typed = updateSection(doc, page.id, hero.id, { title: "Slow " });
    assert.equal(home(typed).sections.find((section) => section.id === hero.id)!.settings.title, "Slow ");
  });

  it("turns the hero booking bar on by default and remembers when it is off", () => {
    const doc = prepareNewDocument("coastal");
    assert.equal(doc.design.heroBooking, true);
    const off = sanitizeDocument({ ...doc, design: { ...doc.design, heroBooking: false } });
    assert.equal(off.design.heroBooking, false);
    const legacy = sanitizeDocument({ ...doc, design: { paletteId: "tide" } });
    assert.equal(legacy.design.heroBooking, true);
  });
});
