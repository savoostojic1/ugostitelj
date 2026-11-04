import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  preferencesFromRow,
} from "@/lib/notifications/preferences";
import {
  dispatchReservationNotice,
  memoryDeliveryStore,
  type BookingNotice,
  type DispatchPorts,
  type EmailSendResult,
} from "@/lib/notifications/dispatch";
import {
  guestEmail,
  ownerEmail,
  pushNotice,
  resolveEmailLocale,
} from "@/lib/notifications/email-templates";
import { notificationEventForState } from "@/lib/notifications/delivery";

function notice(overrides: Partial<BookingNotice> = {}): BookingNotice {
  return {
    id: "request-1",
    hostId: "host-a",
    status: "pending",
    locale: "en",
    propertyName: "Stone House",
    propertyAddress: "Kotor",
    houseRules: "Door code 1234",
    checkInLabel: "1 Dec 2026",
    checkOutLabel: "5 Dec 2026",
    guestCountLabel: "2 guests",
    guestName: "Ada Guest",
    guestEmail: "ada@example.com",
    guestPhone: "+38267111222",
    reference: "HV-AB23CD45",
    manageUrl: "https://www.hostvia.me/reservation/manage/example-token",
    dashboardUrl: "https://www.hostvia.me/dashboard/booking-requests",
    hostName: "Petra",
    hostEmail: "petra@example.com",
    hostPhone: "+38267000000",
    cancelledAtLabel: null,
    cancelledBy: null,
    message: "Late arrival",
    ownerEmail: "owner@example.com",
    ...overrides,
  };
}

function harness(booking: BookingNotice, options?: {
  email?: (to: string) => EmailSendResult;
  push?: DispatchPorts["sendPush"];
  preferences?: DispatchPorts["preferences"];
}) {
  const store = memoryDeliveryStore();
  const emails: string[] = [];
  const pushes: Array<{ title: string; body: string; url: string }> = [];
  const ports: DispatchPorts = {
    now: () => new Date("2026-11-04T12:00:00.000Z"),
    load: async () => booking,
    preferences: options?.preferences ?? (async () => ({ ...DEFAULT_NOTIFICATION_PREFERENCES })),
    claim: store.claim,
    complete: store.complete,
    sendEmail: async (message) => {
      emails.push(`${message.to}|${message.subject}|${message.text}`);
      return options?.email?.(message.to) ?? { ok: true };
    },
    sendPush: options?.push ?? (async (push) => {
      pushes.push(push);
      return "sent";
    }),
  };
  return { ports, emails, pushes, store };
}

test("email defaults are on and unknown languages stay English", () => {
  const prefs = preferencesFromRow(null);
  assert.equal(prefs.emailNewRequest, true);
  assert.equal(prefs.emailConfirmation, true);
  assert.equal(prefs.emailCancellation, true);
  assert.equal(resolveEmailLocale("sr"), "en");
  assert.equal(resolveEmailLocale("en"), "en");
});

test("guest and owner templates distinguish a request from a confirmed stay", () => {
  const data = notice();
  const received = guestEmail("request_received", data);
  const confirmed = guestEmail("confirmed", data);
  const ownerRequest = ownerEmail("request_received", data);
  const guestCancel = guestEmail("cancelled_by_guest", {
    ...data,
    cancelledAtLabel: "2 Nov 2026, 15:04",
  });
  const ownerGuestCancel = ownerEmail("cancelled_by_guest", data);
  const ownerCancel = guestEmail("cancelled_by_owner", data);

  assert.match(received.text, /not a confirmed reservation yet/i);
  assert.match(received.html, /Manage this request/);
  assert.match(received.text, /ada@example.com/);
  assert.match(confirmed.text, /reservation is confirmed/i);
  assert.match(confirmed.text, /petra@example.com/);
  assert.match(confirmed.text, /Door code 1234/);
  assert.match(ownerRequest.text, /dashboard\/booking-requests/);
  assert.match(ownerRequest.text, /Ada Guest/);
  assert.match(guestCancel.text, /owner has been notified/i);
  assert.match(ownerGuestCancel.text, /cancelled/i);
  assert.match(ownerCancel.text, /property owner cancelled/i);

  for (const message of [received, confirmed, guestCancel, ownerCancel, ownerRequest, ownerGuestCancel]) {
    assert.match(message.text, /not a payment receipt|does not process refunds|No refund/i);
    assert.doesNotMatch(message.text, /payment received|paid in full|charged/i);
    assert.doesNotMatch(message.html, /<script/i);
  }
});

test("guest names cannot break the email html", () => {
  const message = guestEmail(
    "request_received",
    notice({ guestName: "<script>alert(1)</script>" })
  );
  assert.match(message.html, /&lt;script&gt;/);
  assert.doesNotMatch(message.html, /<script>/);
});

test("push previews omit guest email and phone", () => {
  const data = notice();
  for (const kind of [
    "request_received",
    "confirmed",
    "cancelled_by_guest",
    "cancelled_by_owner",
  ] as const) {
    const push = pushNotice(kind, data);
    assert.equal(push.body.includes(data.guestEmail), false);
    assert.equal(push.body.includes(data.guestPhone), false);
    assert.equal(push.title.includes(data.guestEmail), false);
    assert.match(push.url, /^\/dashboard\//);
  }
});

test("a new request emails the guest and the owner and pushes the owner", async () => {
  const booking = notice();
  const { ports, emails, pushes } = harness(booking);
  const result = await dispatchReservationNotice(ports, booking.id, "request_received");
  assert.equal(result.ok, true);
  assert.equal(emails.some((item) => item.startsWith("ada@example.com")), true);
  assert.equal(emails.some((item) => item.startsWith("owner@example.com")), true);
  assert.equal(pushes.length, 1);
  assert.equal(pushes[0]?.url, "/dashboard/booking-requests");
  assert.equal(pushes[0]?.body.includes(booking.guestEmail), false);
  assert.equal(pushes[0]?.body.includes(booking.guestPhone), false);
});

test("owner confirmation emails the guest once", async () => {
  const booking = notice({
    status: "confirmed",
    dashboardUrl: "https://www.hostvia.me/dashboard/manual-reservations",
  });
  const { ports, emails } = harness(booking);
  await dispatchReservationNotice(ports, booking.id, "confirmed");
  await dispatchReservationNotice(ports, booking.id, "confirmed");
  const guestMessages = emails.filter((item) => item.startsWith("ada@example.com"));
  assert.equal(guestMessages.length, 1);
  assert.match(guestMessages[0] ?? "", /confirmed/i);
});

test("repeated status updates do not send a second email", async () => {
  const booking = notice({ status: "cancelled", cancelledBy: "guest" });
  const { ports, emails } = harness(booking);
  await dispatchReservationNotice(ports, booking.id, "cancelled_by_guest");
  const second = await dispatchReservationNotice(ports, booking.id, "cancelled_by_guest");
  assert.equal(emails.length, 2);
  assert.equal(
    second.results.every((item) => item.result === "duplicate"),
    true
  );
});

test("a confirmation is not sent for a request that is still pending", async () => {
  const booking = notice({ status: "pending" });
  const { ports, emails, pushes } = harness(booking);
  await dispatchReservationNotice(ports, booking.id, "confirmed");
  assert.equal(emails.length, 0);
  assert.equal(pushes.length, 0);
});

test("email provider failure does not block the other recipient", async () => {
  const booking = notice();
  const { ports, emails } = harness(booking, {
    email: (to) =>
      to === "ada@example.com"
        ? { ok: false, retryable: true, error: "Resend 503" }
        : { ok: true },
  });
  const result = await dispatchReservationNotice(ports, booking.id, "request_received");
  assert.equal(result.ok, true);
  assert.equal(
    result.results.find((item) => item.channel === "email_guest")?.result,
    "failed"
  );
  assert.equal(
    result.results.find((item) => item.channel === "email_owner")?.result,
    "sent"
  );
  assert.equal(emails.some((item) => item.startsWith("owner@example.com")), true);
});

test("disabled owner email still sends the guest email", async () => {
  const booking = notice();
  const { ports, emails } = harness(booking, {
    preferences: async () => ({
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      emailNewRequest: false,
      pushNewRequest: false,
    }),
  });
  const result = await dispatchReservationNotice(ports, booking.id, "request_received");
  assert.equal(emails.length, 1);
  assert.match(emails[0] ?? "", /^ada@example.com/);
  assert.equal(
    result.results.find((item) => item.channel === "email_owner")?.result,
    "skipped"
  );
  assert.equal(
    result.results.find((item) => item.channel === "push_owner")?.result,
    "skipped"
  );
});

test("push delivery records a dashboard link without contact details", async () => {
  const booking = notice({ status: "cancelled", cancelledBy: "owner" });
  const { ports, pushes } = harness(booking);
  const result = await dispatchReservationNotice(ports, booking.id, "cancelled_by_owner");
  assert.equal(pushes.length, 1);
  assert.equal(pushes[0]?.url, "/dashboard/booking-requests");
  assert.equal(
    result.results.find((item) => item.channel === "push_owner")?.result,
    "sent"
  );
});

test("missing push subscriptions are skipped instead of failing the booking", async () => {
  const booking = notice();
  const { ports } = harness(booking, {
    push: async () => "skipped",
  });
  const result = await dispatchReservationNotice(ports, booking.id, "request_received");
  assert.equal(
    result.results.find((item) => item.channel === "push_owner")?.result,
    "skipped"
  );
  assert.equal(
    result.results.find((item) => item.channel === "email_guest")?.result,
    "sent"
  );
});

test("backfill picks the event that matches the saved status", () => {
  assert.equal(
    notificationEventForState({ status: "pending", cancelledBy: null }),
    "request_received"
  );
  assert.equal(
    notificationEventForState({ status: "confirmed", cancelledBy: null }),
    "confirmed"
  );
  assert.equal(
    notificationEventForState({ status: "cancelled", cancelledBy: "guest" }),
    "cancelled_by_guest"
  );
  assert.equal(
    notificationEventForState({ status: "cancelled", cancelledBy: "owner" }),
    "cancelled_by_owner"
  );
  assert.equal(
    notificationEventForState({ status: "declined", cancelledBy: null }),
    null
  );
});
