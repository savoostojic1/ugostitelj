import assert from "node:assert/strict";
import test from "node:test";
import {
  guestBookingRequestErrorMessage,
  parseJsonResponse,
} from "@/lib/public/parse-json-response";

function mockResponse(
  body: string,
  init?: { status?: number; contentType?: string | null }
): Response {
  const headers = new Headers();
  if (init?.contentType !== null) {
    headers.set("content-type", init?.contentType ?? "application/json");
  }
  return new Response(body, {
    status: init?.status ?? 200,
    headers,
  });
}

test("parseJsonResponse accepts valid JSON success payloads", async () => {
  const parsed = await parseJsonResponse<{ ok: boolean; id: string }>(
    mockResponse(JSON.stringify({ ok: true, id: "abc" })),
    { endpoint: "/api/booking-requests" }
  );

  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.data.id, "abc");
    assert.equal(parsed.status, 200);
  }
});

test("parseJsonResponse handles HTML DOCTYPE bodies without throwing", async () => {
  const html = "<!DOCTYPE html><html><body>Login</body></html>";
  const parsed = await parseJsonResponse(
    mockResponse(html, { status: 200, contentType: "text/html" }),
    { endpoint: "/api/booking-requests" }
  );

  assert.equal(parsed.ok, false);
  if (!parsed.ok) {
    assert.equal(parsed.nonJson, true);
    assert.match(parsed.error, /could not send your request/i);
    assert.equal(parsed.status, 200);
  }
});

test("parseJsonResponse handles invalid JSON text", async () => {
  const parsed = await parseJsonResponse(
    mockResponse("not-json", { contentType: "text/plain" }),
    { endpoint: "/api/booking-requests" }
  );

  assert.equal(parsed.ok, false);
  if (!parsed.ok) {
    assert.equal(parsed.nonJson, true);
  }
});

test("guestBookingRequestErrorMessage prefers API error strings", () => {
  assert.equal(
    guestBookingRequestErrorMessage(
      {
        ok: true,
        data: { error: "The selected dates are not available" },
        status: 400,
      },
      false
    ),
    "The selected dates are not available"
  );

  assert.match(
    guestBookingRequestErrorMessage(
      {
        ok: false,
        error: "We could not send your request right now. Please try again in a moment.",
        status: 502,
        nonJson: true,
      },
      false
    ),
    /could not send your request/i
  );
});
