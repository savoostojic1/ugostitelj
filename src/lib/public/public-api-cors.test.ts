import assert from "node:assert/strict";
import test from "node:test";
import { getPublicApiCorsHeaders } from "@/lib/public/public-api-cors";

test("public API CORS reflects allowed Translate origins", () => {
  const headers = new Headers(
    getPublicApiCorsHeaders(
      new Request("https://petra-matakova.hostvia.me/api/booking-requests", {
        headers: {
          origin: "https://petra--matakova-hostvia-me.translate.goog",
        },
      })
    )
  );

  assert.equal(
    headers.get("Access-Control-Allow-Origin"),
    "https://petra--matakova-hostvia-me.translate.goog"
  );
  assert.match(headers.get("Access-Control-Allow-Methods") ?? "", /POST/);
});

test("public API CORS ignores unrelated origins", () => {
  const headers = new Headers(
    getPublicApiCorsHeaders(
      new Request("https://hostvia.me/api/booking-requests", {
        headers: { origin: "https://evil.example.com" },
      })
    )
  );

  assert.equal(headers.get("Access-Control-Allow-Origin"), null);
});
