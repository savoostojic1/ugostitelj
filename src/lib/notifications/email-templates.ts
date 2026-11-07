import { reservationMoneyLabels } from "@/lib/currency/format";
import type { CancellationSource } from "@/lib/reservations/guest-access";

export type EmailLocale = "en";

export function resolveEmailLocale(
  language: string | null | undefined
): EmailLocale {
  const value = language?.trim().toLowerCase();
  if (value === "en" || value === "en-us" || value === "en-gb") return "en";
  // Host profiles do not store a language yet. The product locale is English.
  return "en";
}

export type ReservationEmailData = {
  locale: EmailLocale;
  propertyName: string;
  propertyAddress: string | null;
  houseRules: string | null;
  checkInLabel: string;
  checkOutLabel: string;
  guestCountLabel: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  reference: string | null;
  manageUrl: string | null;
  dashboardUrl: string;
  hostName: string | null;
  hostEmail: string | null;
  hostPhone: string | null;
  cancelledAtLabel: string | null;
  cancelledBy: CancellationSource | null;
  message: string | null;
  currencyCode?: string | null;
  totalAmount?: number | null;
  nightlyRate?: number | null;
};

export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

export type GuestEmailKind =
  | "request_received"
  | "confirmed"
  | "cancelled_by_guest"
  | "cancelled_by_owner";

export type OwnerEmailKind =
  | "request_received"
  | "confirmed"
  | "cancelled_by_guest"
  | "cancelled_by_owner";

const ACCENT = "#6d28d9";
const TEXT = "#18181b";
const MUTED = "#71717a";
const SURFACE = "#f4f4f5";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function lines(...parts: Array<string | null | undefined | false>): string {
  return parts.filter((part): part is string => Boolean(part)).join("\n");
}

function layout(input: {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  rows: Array<[string, string]>;
  note?: string | null;
  action?: { href: string; label: string } | null;
  extra?: string | null;
}): string {
  const rows = input.rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:${MUTED};font-size:13px;width:140px;vertical-align:top">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:${TEXT};font-size:14px;font-weight:600">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  const action = input.action
    ? `<p style="margin:24px 0 0">
        <a href="${escapeHtml(input.action.href)}" style="display:inline-block;padding:12px 18px;background:${ACCENT};color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px">${escapeHtml(input.action.label)}</a>
      </p>`
    : "";

  const note = input.note
    ? `<p style="margin:20px 0 0;padding:12px 14px;background:${SURFACE};border-radius:10px;color:${TEXT};font-size:14px;line-height:1.5">${escapeHtml(input.note)}</p>`
    : "";

  const extra = input.extra
    ? `<p style="margin:16px 0 0;color:${TEXT};font-size:14px;line-height:1.5;white-space:pre-wrap">${escapeHtml(input.extra)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:${SURFACE}">
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(input.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};padding:24px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:28px 24px;font-family:Georgia, 'Times New Roman', serif;color:${TEXT}">
            <tr>
              <td>
                <p style="margin:0 0 18px;font-family:system-ui,sans-serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:${ACCENT};font-weight:700">Hostvia</p>
                <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED}">${escapeHtml(input.eyebrow)}</p>
                <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700">${escapeHtml(input.title)}</h1>
                <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:${TEXT}">${escapeHtml(input.intro)}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;font-family:system-ui,sans-serif">${rows}</table>
                ${note}
                ${extra}
                ${action}
                <p style="margin:28px 0 0;font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;color:${MUTED}">Hostvia · This message is not a payment receipt. Hostvia does not collect payment for this stay.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function stayRows(data: ReservationEmailData): Array<[string, string]> {
  const money = reservationMoneyLabels(data);
  const rows: Array<[string, string]> = [
    ["Property", data.propertyName],
    ["Check-in", data.checkInLabel],
    ["Check-out", data.checkOutLabel],
    ["Guests", data.guestCountLabel],
  ];
  if (money.totalLabel) rows.push(["Total", money.totalLabel]);
  if (money.nightlyLabel) rows.push(["Nightly rate", money.nightlyLabel]);
  if (data.reference) rows.push(["Reference", data.reference]);
  if (data.propertyAddress) rows.push(["Address", data.propertyAddress]);
  return rows;
}

function priceText(data: ReservationEmailData): Array<string | null> {
  const money = reservationMoneyLabels(data);
  return [
    money.totalLabel ? `Total: ${money.totalLabel}` : null,
    money.nightlyLabel ? `Nightly rate: ${money.nightlyLabel}` : null,
  ];
}

function contactLine(
  email: string | null,
  phone: string | null
): string | null {
  const parts = [email, phone].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function guestEmail(
  kind: GuestEmailKind,
  data: ReservationEmailData
): EmailContent {
  const manageUrl = safeHttpUrl(data.manageUrl);
  const property = data.propertyName;

  if (kind === "request_received") {
    const subject = `Request received — ${property}`;
    const intro =
      "We received your booking request. It is not a confirmed reservation yet. The property owner needs to review it.";
    const text = lines(
      intro,
      "",
      `Property: ${property}`,
      `Check-in: ${data.checkInLabel}`,
      `Check-out: ${data.checkOutLabel}`,
      `Guests: ${data.guestCountLabel}`,
      ...priceText(data),
      data.reference ? `Reference: ${data.reference}` : null,
      `Name: ${data.guestName}`,
      `Email: ${data.guestEmail}`,
      `Phone: ${data.guestPhone}`,
      "",
      "The property owner will confirm the request before it becomes a reservation.",
      manageUrl ? `Manage this request: ${manageUrl}` : null,
      "",
      "This message is not a payment receipt."
    );
    return {
      subject,
      text,
      html: layout({
        preheader: "This is a booking request, not a confirmed reservation.",
        eyebrow: "Booking request",
        title: property,
        intro,
        rows: [
          ...stayRows(data),
          ["Name", data.guestName],
          ["Email", data.guestEmail],
          ["Phone", data.guestPhone],
        ],
        note: "Nothing is reserved until the property owner confirms this request.",
        action: manageUrl
          ? { href: manageUrl, label: "Manage this request" }
          : null,
      }),
    };
  }

  if (kind === "confirmed") {
    const hostContact = contactLine(data.hostEmail, data.hostPhone);
    const subject = `Reservation confirmed — ${property}`;
    const intro = "Your reservation is confirmed.";
    const text = lines(
      intro,
      "",
      `Property: ${property}`,
      `Check-in: ${data.checkInLabel}`,
      `Check-out: ${data.checkOutLabel}`,
      `Guests: ${data.guestCountLabel}`,
      ...priceText(data),
      data.reference ? `Reference: ${data.reference}` : null,
      data.hostName ? `Host: ${data.hostName}` : null,
      hostContact ? `Host contact: ${hostContact}` : null,
      data.houseRules ? `Check-in information: ${data.houseRules}` : null,
      manageUrl ? `Manage this reservation: ${manageUrl}` : null,
      "",
      "This message is not a payment receipt."
    );
    return {
      subject,
      text,
      html: layout({
        preheader: "Your reservation is confirmed.",
        eyebrow: "Confirmed reservation",
        title: property,
        intro,
        rows: [
          ...stayRows(data),
          ...(data.hostName ? [["Host", data.hostName] as [string, string]] : []),
          ...(hostContact
            ? [["Host contact", hostContact] as [string, string]]
            : []),
        ],
        extra: data.houseRules
          ? `Check-in information\n${data.houseRules.slice(0, 600)}`
          : null,
        action: manageUrl
          ? { href: manageUrl, label: "View reservation" }
          : null,
      }),
    };
  }

  if (kind === "cancelled_by_guest") {
    const subject = `Cancellation confirmed — ${property}`;
    const intro =
      "Your cancellation is confirmed. The property owner has been notified.";
    const text = lines(
      intro,
      data.cancelledAtLabel ? `Cancelled: ${data.cancelledAtLabel}` : null,
      `Property: ${property}`,
      `Check-in: ${data.checkInLabel}`,
      `Check-out: ${data.checkOutLabel}`,
      ...priceText(data),
      data.reference ? `Reference: ${data.reference}` : null,
      "",
      "Hostvia does not process refunds.",
      manageUrl ? `View the cancellation: ${manageUrl}` : null
    );
    return {
      subject,
      text,
      html: layout({
        preheader: "Your cancellation is confirmed.",
        eyebrow: "Cancellation confirmed",
        title: property,
        intro,
        rows: [
          ...stayRows(data),
          ...(data.cancelledAtLabel
            ? [["Cancelled", data.cancelledAtLabel] as [string, string]]
            : []),
        ],
        note: "The property owner has been notified. Hostvia does not process refunds.",
        action: manageUrl ? { href: manageUrl, label: "View cancellation" } : null,
      }),
    };
  }

  const hostContact = contactLine(data.hostEmail, data.hostPhone);
  const subject = `Reservation cancelled — ${property}`;
  const intro = "The property owner cancelled this reservation.";
  const text = lines(
    intro,
    data.cancelledAtLabel ? `Cancelled: ${data.cancelledAtLabel}` : null,
    `Property: ${property}`,
    `Check-in: ${data.checkInLabel}`,
    `Check-out: ${data.checkOutLabel}`,
    ...priceText(data),
    data.reference ? `Reference: ${data.reference}` : null,
    hostContact ? `Host contact: ${hostContact}` : null,
    "",
    "Hostvia does not process refunds.",
    manageUrl ? `View the reservation: ${manageUrl}` : null
  );
  return {
    subject,
    text,
    html: layout({
      preheader: "The property owner cancelled this reservation.",
      eyebrow: "Reservation cancelled",
      title: property,
      intro,
      rows: [
        ...stayRows(data),
        ...(data.cancelledAtLabel
          ? [["Cancelled", data.cancelledAtLabel] as [string, string]]
          : []),
        ...(hostContact
          ? [["Host contact", hostContact] as [string, string]]
          : []),
      ],
      note: "Hostvia does not process refunds. Contact the property owner if you need help.",
      action: manageUrl ? { href: manageUrl, label: "View reservation" } : null,
    }),
  };
}

export function ownerEmail(
  kind: OwnerEmailKind,
  data: ReservationEmailData
): EmailContent {
  const dashboardUrl = safeHttpUrl(data.dashboardUrl);
  const property = data.propertyName;

  if (kind === "request_received") {
    const subject = `New booking request — ${property}`;
    const intro = `${data.guestName} sent a booking request. It is not confirmed until you accept it.`;
    const text = lines(
      intro,
      "",
      `Property: ${property}`,
      `Guest: ${data.guestName}`,
      `Dates: ${data.checkInLabel} – ${data.checkOutLabel}`,
      `Guests: ${data.guestCountLabel}`,
      ...priceText(data),
      data.reference ? `Reference: ${data.reference}` : null,
      `Email: ${data.guestEmail}`,
      `Phone: ${data.guestPhone}`,
      data.message ? `Message: ${data.message}` : null,
      dashboardUrl ? `Open the request: ${dashboardUrl}` : null,
      "",
      "This message is not a payment receipt."
    );
    return {
      subject,
      text,
      html: layout({
        preheader: "A guest sent a booking request. It is not confirmed yet.",
        eyebrow: "New booking request",
        title: property,
        intro,
        rows: [
          ["Guest", data.guestName],
          ...stayRows(data),
          ["Email", data.guestEmail],
          ["Phone", data.guestPhone],
        ],
        extra: data.message,
        action: dashboardUrl
          ? { href: dashboardUrl, label: "Review request" }
          : null,
      }),
    };
  }

  if (kind === "confirmed") {
    const subject = `Reservation confirmed — ${property}`;
    const intro = `You confirmed ${data.guestName}'s reservation.`;
    const text = lines(
      intro,
      `Property: ${property}`,
      `Dates: ${data.checkInLabel} – ${data.checkOutLabel}`,
      `Guests: ${data.guestCountLabel}`,
      ...priceText(data),
      data.reference ? `Reference: ${data.reference}` : null,
      dashboardUrl ? `Open bookings: ${dashboardUrl}` : null,
      "",
      "This message is not a payment receipt."
    );
    return {
      subject,
      text,
      html: layout({
        preheader: "The reservation status is now confirmed.",
        eyebrow: "Status updated",
        title: "Reservation confirmed",
        intro,
        rows: [["Guest", data.guestName], ...stayRows(data)],
        action: dashboardUrl ? { href: dashboardUrl, label: "Open bookings" } : null,
      }),
    };
  }

  if (kind === "cancelled_by_guest") {
    const subject = `Guest cancelled — ${property}`;
    const intro = `${data.guestName} cancelled this reservation.`;
    const text = lines(
      intro,
      data.cancelledAtLabel ? `Cancelled: ${data.cancelledAtLabel}` : null,
      `Property: ${property}`,
      `Dates: ${data.checkInLabel} – ${data.checkOutLabel}`,
      ...priceText(data),
      data.reference ? `Reference: ${data.reference}` : null,
      "The dates are no longer blocked on the Hostvia calendar.",
      dashboardUrl ? `Open inquiries: ${dashboardUrl}` : null,
      "",
      "This message is not a payment receipt. No refund was issued."
    );
    return {
      subject,
      text,
      html: layout({
        preheader: "A guest cancelled a reservation.",
        eyebrow: "Cancelled by guest",
        title: property,
        intro,
        rows: [
          ["Guest", data.guestName],
          ...stayRows(data),
          ...(data.cancelledAtLabel
            ? [["Cancelled", data.cancelledAtLabel] as [string, string]]
            : []),
        ],
        note: "The dates are no longer blocked on the Hostvia calendar. No refund was issued.",
        action: dashboardUrl
          ? { href: dashboardUrl, label: "Open inquiries" }
          : null,
      }),
    };
  }

  const subject = `Cancellation completed — ${property}`;
  const intro = `You cancelled ${data.guestName}'s reservation.`;
  const text = lines(
    intro,
    data.cancelledAtLabel ? `Cancelled: ${data.cancelledAtLabel}` : null,
    `Property: ${property}`,
    `Dates: ${data.checkInLabel} – ${data.checkOutLabel}`,
    ...priceText(data),
    data.reference ? `Reference: ${data.reference}` : null,
    dashboardUrl ? `Open inquiries: ${dashboardUrl}` : null,
    "",
    "This message is not a payment receipt. No refund was issued."
  );
  return {
    subject,
    text,
    html: layout({
      preheader: "The cancellation was completed.",
      eyebrow: "Cancellation completed",
      title: property,
      intro,
      rows: [
        ["Guest", data.guestName],
        ...stayRows(data),
        ...(data.cancelledAtLabel
          ? [["Cancelled", data.cancelledAtLabel] as [string, string]]
          : []),
      ],
      note: "No refund was issued.",
      action: dashboardUrl ? { href: dashboardUrl, label: "Open inquiries" } : null,
    }),
  };
}

export type PushNotice = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

export function pushNotice(
  kind: OwnerEmailKind,
  data: Pick<
    ReservationEmailData,
    "propertyName" | "guestName" | "checkInLabel" | "reference"
  >
): PushNotice {
  const property = data.propertyName.slice(0, 48);
  const guest = data.guestName.slice(0, 40);
  const reference = data.reference ?? kind;
  const dates = data.checkInLabel;

  if (kind === "request_received") {
    return {
      title: "New booking request",
      body: `${guest} · ${property} · ${dates}`,
      url: "/dashboard/booking-requests",
      tag: `hostvia-request-${reference}`,
    };
  }

  if (kind === "confirmed") {
    return {
      title: "Reservation confirmed",
      body: `${guest} · ${property}`,
      url: "/dashboard/manual-reservations",
      tag: `hostvia-confirmed-${reference}`,
    };
  }

  if (kind === "cancelled_by_guest") {
    return {
      title: "Guest cancelled",
      body: `${guest} · ${property}`,
      url: "/dashboard/booking-requests",
      tag: `hostvia-cancelled-${reference}`,
    };
  }

  return {
    title: "Reservation cancelled",
    body: `${property} · cancellation completed`,
    url: "/dashboard/booking-requests",
    tag: `hostvia-owner-cancel-${reference}`,
  };
}
