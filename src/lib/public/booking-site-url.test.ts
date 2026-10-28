import assert from "node:assert/strict";
import test from "node:test";
import {
  bookingSiteOrigin,
  getBookingSiteUrl,
} from "@/lib/public/booking-site-url";
import { buildHostMetadata } from "@/lib/public/seo";

test("bookingSiteOrigin strips a /host path so URLs cannot double", () => {
  assert.equal(
    bookingSiteOrigin("https://hostvia.me/host/fairy-tale"),
    "https://hostvia.me"
  );
  assert.equal(bookingSiteOrigin("https://hostvia.me/"), "https://hostvia.me");
  assert.equal(
    bookingSiteOrigin("https://fairy-tale.hostvia.me"),
    "https://fairy-tale.hostvia.me"
  );
});

test("getBookingSiteUrl does not append /host twice when baseUrl already has it", () => {
  const url = getBookingSiteUrl("fairy-tale", {
    baseUrl: "https://hostvia.me/host/fairy-tale",
    useSubdomain: false,
  });
  assert.equal(url, "https://hostvia.me/host/fairy-tale");
});

test("host metadata canonical stays a single /host/{username} path", () => {
  const metadata = buildHostMetadata(
    "Bungalows Fairy Tale",
    "A peaceful retreat",
    null,
    "fairy-tale",
    { baseUrl: "https://hostvia.me/host/fairy-tale", useSubdomain: false }
  );

  assert.equal(metadata.alternates?.canonical, "https://hostvia.me/host/fairy-tale");
  assert.equal(metadata.openGraph?.url, "https://hostvia.me/host/fairy-tale");
});
