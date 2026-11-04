import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGuestReservationView,
  canGuestCancelReservation,
  canTransitionReservation,
  generateManageToken,
  generateReferenceCode,
  hashManageToken,
  hostOwnsResource,
  isManageTokenExpired,
  isManageTokenShape,
  isReferenceCode,
  manageTokenExpiresAt,
  openManageToken,
  sealManageToken,
  tokenAuthorizes,
} from "@/lib/reservations/guest-access";

const secret = "test-reservation-link-secret";

function record(overrides: Partial<Parameters<typeof buildGuestReservationView>[0]> = {}) {
  return {
    status: "pending" as const,
    expiresAt: "2027-06-01T00:00:00.000Z",
    reference: "HV-AB23CD45",
    propertyName: "Stone House",
    propertyAddress: "Kotor",
    checkIn: "2026-12-01",
    checkOut: "2026-12-05",
    guestCount: 2,
    guestName: "Ada Guest",
    houseRules: "Door code 1234",
    hostName: "Petra",
    hostEmail: "petra@example.com",
    hostPhone: "+38267000000",
    ...overrides,
  };
}

test("manage tokens are unguessable and only the hash is comparable", () => {
  const token = generateManageToken();
  const other = generateManageToken();
  assert.equal(isManageTokenShape(token), true);
  assert.notEqual(token, other);
  assert.equal(token.includes("."), false);
  const hash = hashManageToken(token);
  assert.equal(hash.length, 64);
  assert.equal(hash.includes(token), false);
  assert.equal(tokenAuthorizes(hash, token), true);
  assert.equal(tokenAuthorizes(hash, other), false);
  assert.equal(tokenAuthorizes(hashManageToken(other), token), false);
});

test("a management token seals and opens only with the server secret", () => {
  const token = generateManageToken();
  const sealed = sealManageToken(token, secret);
  assert.equal(sealed.includes(token), false);
  assert.equal(openManageToken(sealed, secret), token);
  assert.equal(openManageToken(sealed, "other-secret"), null);
});

test("reference codes are public labels, not database ids", () => {
  const code = generateReferenceCode();
  assert.equal(isReferenceCode(code), true);
  assert.equal(code.startsWith("HV-"), true);
  assert.equal(code.includes("-") && code.length === 11, true);
});

test("management links stay valid past checkout and expire afterwards", () => {
  const expires = manageTokenExpiresAt("2026-12-05", new Date("2026-11-01T00:00:00.000Z"));
  assert.ok(expires.getTime() > new Date("2026-12-05T00:00:00.000Z").getTime());
  assert.equal(isManageTokenExpired(expires, new Date("2026-11-02T00:00:00.000Z")), false);
  assert.equal(
    isManageTokenExpired("2026-01-01T00:00:00.000Z", new Date("2026-02-01T00:00:00.000Z")),
    true
  );
  assert.equal(isManageTokenExpired(null), true);
});

test("a pending request is not described as a confirmed reservation", () => {
  const view = buildGuestReservationView(record(), new Date("2026-11-01T00:00:00.000Z"));
  assert.equal(view.state, "active");
  if (view.state !== "active") return;
  assert.equal(view.status, "pending");
  assert.match(view.message, /not a confirmed reservation/i);
  assert.equal(view.canCancel, true);
  assert.equal(view.reference, "HV-AB23CD45");
  assert.equal(view.propertyName, "Stone House");
});

test("an expired token does not reveal the reservation", () => {
  const view = buildGuestReservationView(
    record({ expiresAt: "2020-01-01T00:00:00.000Z" }),
    new Date("2026-11-01T00:00:00.000Z")
  );
  assert.equal(view.state, "expired");
  assert.equal("propertyName" in view, false);
  assert.equal("guestName" in view, false);
});

test("an unknown token is invalid", () => {
  assert.equal(buildGuestReservationView(null).state, "invalid");
});

test("confirmed, declined, and cancelled stays use different next steps", () => {
  const now = new Date("2026-11-01T00:00:00.000Z");
  const confirmed = buildGuestReservationView(record({ status: "accepted" }), now);
  const declined = buildGuestReservationView(record({ status: "rejected" }), now);
  const cancelled = buildGuestReservationView(
    record({
      status: "cancelled",
      cancelledAt: "2026-11-02T15:04:00.000Z",
      cancelledBy: "guest",
    }),
    now
  );

  assert.equal(confirmed.state, "active");
  assert.equal(declined.state, "active");
  assert.equal(cancelled.state, "active");
  if (confirmed.state !== "active" || declined.state !== "active" || cancelled.state !== "active") {
    return;
  }
  assert.equal(confirmed.status, "confirmed");
  assert.match(confirmed.message, /confirmed/i);
  assert.equal(confirmed.canCancel, true);
  assert.equal(declined.status, "declined");
  assert.match(declined.message, /not confirmed/i);
  assert.equal(declined.canCancel, false);
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.canCancel, false);
  assert.match(cancelled.nextStep, /owner has been notified/i);
  assert.equal(cancelled.cancelledBy, "guest");
});

test("guests cannot cancel a finished stay or repeat a cancellation", () => {
  assert.equal(
    canGuestCancelReservation({
      status: "confirmed",
      checkOut: "2026-12-05",
      now: new Date("2026-12-05T12:00:00.000Z"),
    }),
    false
  );
  assert.equal(
    canGuestCancelReservation({
      status: "cancelled",
      checkOut: "2026-12-05",
      now: new Date("2026-11-01T00:00:00.000Z"),
    }),
    false
  );
  assert.equal(canTransitionReservation("confirmed", "confirmed"), false);
  assert.equal(canTransitionReservation("pending", "confirmed"), true);
  assert.equal(canTransitionReservation("confirmed", "cancelled"), true);
  assert.equal(canTransitionReservation("declined", "cancelled"), false);
  assert.equal(canTransitionReservation("cancelled", "confirmed"), false);
});

test("one host cannot authorize another host's reservation", () => {
  const hostA = "11111111-1111-4111-8111-111111111111";
  const hostB = "22222222-2222-4222-8222-222222222222";
  assert.equal(hostOwnsResource(hostA, hostA), true);
  assert.equal(hostOwnsResource(hostA, hostB), false);
  assert.equal(hostOwnsResource("", hostA), false);
  assert.equal(hostOwnsResource(hostA, null), false);
});
