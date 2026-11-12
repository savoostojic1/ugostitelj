import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addAccommodation, prepareNewDocument, updateAccommodation, withProfile } from "@/lib/website-builder/document-ops";
import {
  collectLocalImageRefs,
  isLocalImageRef,
  LOCAL_IMAGE_PLACEHOLDER,
  mapDocumentImages,
  registerLocalImageUrl,
  resolveLocalImages,
  stripLocalImages,
} from "@/lib/website-builder/local-images";
import { thumbUrl } from "@/lib/website-builder/photo-library";
import { sanitizeDocument } from "@/lib/website-builder/sanitize";

const A = "local:11111111-aaaa-4bbb-8ccc-000000000001";
const B = "local:11111111-aaaa-4bbb-8ccc-000000000002";
const WEB = "https://cdn.test/kept.jpg";

function documentWithLocalPhotos() {
  let doc = prepareNewDocument("luxe");
  doc = { ...doc, gallery: [{ url: A, alt: "Pool" }, { url: WEB, alt: "View" }] };
  doc = addAccommodation(doc, { name: "Villa", kind: "villa" });
  doc = updateAccommodation(doc, doc.accommodations[0].id, { photos: [{ url: B, alt: "Bedroom" }] });
  doc = withProfile(doc, { logoUrl: A });
  doc.pages[0].sections[0].settings.imageUrl = B;
  doc.pages[0].seo.ogImage = A;
  return sanitizeDocument(doc);
}

describe("photos kept in the browser before sign-up", () => {
  it("survive sanitizing so drafts keep them, while unsafe values are still dropped", () => {
    const doc = documentWithLocalPhotos();
    assert.equal(doc.gallery[0].url, A);
    assert.equal(doc.accommodations[0].photos[0].url, B);
    assert.equal(doc.profile.logoUrl, A);
    assert.equal(doc.pages[0].sections[0].settings.imageUrl, B);
    assert.equal(doc.pages[0].seo.ogImage, A);
    const bad = sanitizeDocument({ ...doc, gallery: [{ url: "local:../../etc", alt: "" }, { url: "javascript:alert(1)", alt: "" }] });
    assert.equal(bad.gallery.length, 0);
    assert.equal(isLocalImageRef("local:short"), false);
  });

  it("are found everywhere in the document", () => {
    assert.deepEqual(collectLocalImageRefs(documentWithLocalPhotos()).sort(), [A, B].sort());
  });

  it("are swapped for uploaded URLs after sign-up", () => {
    const urls = new Map([[A, "https://cdn.test/a.jpg"], [B, "https://cdn.test/b.jpg"]]);
    const doc = mapDocumentImages(documentWithLocalPhotos(), (url) => urls.get(url) ?? url);
    assert.deepEqual(collectLocalImageRefs(doc), []);
    assert.equal(doc.gallery[0].url, "https://cdn.test/a.jpg");
    assert.equal(doc.gallery[1].url, WEB);
    assert.equal(doc.accommodations[0].photos[0].url, "https://cdn.test/b.jpg");
    assert.equal(doc.profile.logoUrl, "https://cdn.test/a.jpg");
  });

  it("never reach a published website", () => {
    const doc = stripLocalImages(documentWithLocalPhotos());
    assert.deepEqual(collectLocalImageRefs(doc), []);
    assert.deepEqual(doc.gallery.map((image) => image.url), [WEB]);
    assert.equal(doc.accommodations[0].photos.length, 0);
    assert.equal(doc.profile.logoUrl, "");
    assert.equal(doc.pages[0].sections[0].settings.imageUrl, "");
  });

  it("show in previews through this tab's object URLs", () => {
    registerLocalImageUrl(A, "blob:http://localhost/a");
    const doc = resolveLocalImages(documentWithLocalPhotos());
    assert.equal(doc.gallery[0].url, "blob:http://localhost/a");
    // B has no preview URL in this tab: it is left out rather than shown broken.
    assert.equal(doc.accommodations[0].photos.length, 0);
    assert.equal(thumbUrl(A), "blob:http://localhost/a");
    assert.equal(thumbUrl(B), LOCAL_IMAGE_PLACEHOLDER);
  });
});
