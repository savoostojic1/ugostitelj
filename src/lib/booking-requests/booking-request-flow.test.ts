import assert from "node:assert/strict";
import test from "node:test";
import { completeBookingRequest } from "@/lib/booking-requests/complete";
import { parseBookingRequestBody } from "@/lib/booking-requests/validate";

const savedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

test("booking request creation accepts a complete stay and rejects bad input", () => {
  const parsed = parseBookingRequestBody({
    propertySlug: "stone-house",
    guestName: "Ada Guest",
    email: "ada@example.com",
    phone: "+38267111",
    checkIn: "2026-12-01",
    checkOut: "2026-12-05",
    guestCount: 2,
    message: "Late arrival",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.propertySlug, "stone-house");
  assert.equal(parsed.value.guestCount, 2);

  assert.equal(
    parseBookingRequestBody({ propertySlug: "stone-house" }).ok,
    false
  );
  const dates = parseBookingRequestBody({
    propertySlug: "stone-house",
    guestName: "Ada",
    email: "ada@example.com",
    phone: "1",
    checkIn: "2026-12-05",
    checkOut: "2026-12-01",
    guestCount: 1,
  });
  assert.equal(dates.ok, false);
  if (!dates.ok) assert.equal(dates.error, "Check-out must be after check-in");

  const guests = parseBookingRequestBody({
    propertySlug: "stone-house",
    guestName: "Ada",
    email: "ada@example.com",
    phone: "1",
    checkIn: "2026-12-01",
    checkOut: "2026-12-05",
    guestCount: 0,
  });
  assert.equal(guests.ok, false);
});

test("a saved booking stays saved when email delivery throws", async () => {
  const result = await completeBookingRequest(savedId, {
    attach: async () => {
      throw new Error("mailbox unavailable");
    },
    notify: async () => ({ emailSent: true }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.id, savedId);
  assert.equal(result.emailSent, false);
  assert.equal(result.manageUrl, null);
});

test("notification failure after the token is saved does not drop the request", async () => {
  const result = await completeBookingRequest(savedId, {
    attach: async () => ({
      token: "token",
      reference: "HV-AB23CD45",
      manageUrl: "https://www.hostvia.me/reservation/manage/token",
    }),
    notify: async () => {
      throw new Error("provider down");
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.id, savedId);
  assert.equal(result.reference, "HV-AB23CD45");
  assert.equal(result.emailSent, false);
});
