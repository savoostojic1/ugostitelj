import assert from "node:assert/strict";
import test from "node:test";

/**
 * Documents the public booking-request API contract. Runtime behavior of the
 * route handler depends on Supabase; these tests lock the response shape the
 * frontend relies on.
 */

type BookingSuccess = { ok: true; id: string };
type BookingFailure = { ok: false; error: string };

function isBookingSuccess(body: unknown): body is BookingSuccess {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return value.ok === true && typeof value.id === "string" && value.id.length > 0;
}

function isBookingFailure(body: unknown): body is BookingFailure {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return value.ok === false && typeof value.error === "string" && value.error.length > 0;
}

test("successful reservation responses include ok+id and never look like HTML", () => {
  const body: BookingSuccess = {
    ok: true,
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  };
  assert.equal(isBookingSuccess(body), true);
  assert.equal(JSON.stringify(body).includes("<!DOCTYPE"), false);
});

test("error reservation responses include ok:false and a guest-safe error string", () => {
  const body: BookingFailure = {
    ok: false,
    error: "The selected dates are not available",
  };
  assert.equal(isBookingFailure(body), true);
  assert.equal(isBookingSuccess(body), false);
});

test("HTML login pages must not be treated as a successful booking response", () => {
  const html = "<!DOCTYPE html><html><body>Login</body></html>";
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(html);
  } catch {
    parsed = null;
  }
  assert.equal(parsed, null);
  assert.equal(isBookingSuccess(parsed), false);
});
