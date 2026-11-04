import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LINK_VERSION = "v1";
const LINK_SALT = "hostvia-reservation-link-v1";

export type StoredBookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "contacted"
  | "cancelled";

export type GuestReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "declined";

export type CancellationSource = "guest" | "owner";

export function generateManageToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isManageTokenShape(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

export function hashManageToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateReferenceCode(): string {
  const bytes = randomBytes(8);
  let body = "";
  for (let index = 0; index < 8; index += 1) {
    body += REFERENCE_ALPHABET[bytes[index]! % REFERENCE_ALPHABET.length];
  }
  return `HV-${body}`;
}

export function isReferenceCode(value: string): boolean {
  return /^HV-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(value);
}

export function manageTokenExpiresAt(checkOut: string, now = new Date()): Date {
  const [year, month, day] = checkOut.split("-").map(Number);
  const checkout = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
  const fromStay = new Date(checkout.getTime() + 180 * 24 * 60 * 60 * 1000);
  const minimum = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return fromStay > minimum ? fromStay : minimum;
}

export function isManageTokenExpired(
  expiresAt: string | Date | null | undefined,
  now = new Date()
): boolean {
  if (!expiresAt) return true;
  const time = expiresAt instanceof Date ? expiresAt.getTime() : new Date(expiresAt).getTime();
  if (Number.isNaN(time)) return true;
  return time <= now.getTime();
}

function linkKey(secret: string): Buffer {
  return scryptSync(secret, LINK_SALT, 32);
}

/** Encrypt the guest token so later emails can rebuild the link. Lookup uses the hash. */
export function sealManageToken(token: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", linkKey(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    LINK_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function openManageToken(payload: string, secret: string): string | null {
  try {
    const [version, ivPart, tagPart, dataPart] = payload.split(".");
    if (version !== LINK_VERSION || !ivPart || !tagPart || !dataPart) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      linkKey(secret),
      Buffer.from(ivPart, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(dataPart, "base64url")),
      decipher.final(),
    ]);
    const token = plain.toString("utf8");
    return isManageTokenShape(token) ? token : null;
  } catch {
    return null;
  }
}

export function tokenAuthorizes(
  storedHash: string | null | undefined,
  presentedToken: string
): boolean {
  if (!storedHash || !isManageTokenShape(presentedToken)) return false;
  const actual = hashManageToken(presentedToken);
  const left = Buffer.from(storedHash);
  const right = Buffer.from(actual);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

export function hostOwnsResource(
  actorHostId: string | null | undefined,
  resourceHostId: string | null | undefined
): boolean {
  return Boolean(actorHostId && resourceHostId && actorHostId === resourceHostId);
}

export function guestReservationStatus(input: {
  status: StoredBookingStatus;
  cancelledAt?: string | null;
}): GuestReservationStatus {
  if (input.status === "cancelled" || input.cancelledAt) return "cancelled";
  if (input.status === "rejected") return "declined";
  if (input.status === "accepted") return "confirmed";
  return "pending";
}

export function canTransitionReservation(
  from: GuestReservationStatus,
  to: GuestReservationStatus
): boolean {
  if (from === to) return false;
  if (to === "confirmed" || to === "declined") return from === "pending";
  if (to === "cancelled") return from === "pending" || from === "confirmed";
  return false;
}

export function utcDateOnly(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function canGuestCancelReservation(input: {
  status: GuestReservationStatus;
  checkOut: string;
  now?: Date;
}): boolean {
  if (input.status !== "pending" && input.status !== "confirmed") return false;
  return input.checkOut > utcDateOnly(input.now);
}

export function formatStayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hourCycle: "h23",
  }).format(date);
}

export function guestCountLabel(count: number): string {
  return `${count} ${count === 1 ? "guest" : "guests"}`;
}

export type GuestReservationRecord = {
  status: StoredBookingStatus;
  cancelledAt?: string | null;
  cancelledBy?: CancellationSource | null;
  expiresAt?: string | null;
  reference?: string | null;
  propertyName: string;
  propertyAddress?: string | null;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guestName: string;
  houseRules?: string | null;
  hostName?: string | null;
  hostEmail?: string | null;
  hostPhone?: string | null;
};

export type GuestReservationView =
  | { state: "invalid" }
  | { state: "expired" }
  | { state: "unavailable" }
  | { state: "limited" }
  | {
      state: "active";
      reference: string | null;
      status: GuestReservationStatus;
      title: string;
      message: string;
      nextStep: string;
      propertyName: string;
      propertyAddress: string | null;
      checkIn: string;
      checkOut: string;
      checkInLabel: string;
      checkOutLabel: string;
      guestCount: number;
      guestCountLabel: string;
      guestName: string;
      houseRules: string | null;
      hostName: string | null;
      hostEmail: string | null;
      hostPhone: string | null;
      canCancel: boolean;
      cancelledAt: string | null;
      cancelledAtLabel: string | null;
      cancelledBy: CancellationSource | null;
    };

function statusCopy(
  status: GuestReservationStatus,
  cancelledBy: CancellationSource | null,
  cancelledAtLabel: string | null
): { title: string; message: string; nextStep: string } {
  if (status === "pending") {
    return {
      title: "Request received",
      message:
        "The property owner has your request and still needs to review it. This is not a confirmed reservation.",
      nextStep:
        "You will receive an email if the owner confirms the stay. You can cancel the request from this page until then.",
    };
  }

  if (status === "confirmed") {
    return {
      title: "Reservation confirmed",
      message: "The property owner confirmed this stay.",
      nextStep:
        "Use the contact details below if you need anything before arrival. You can cancel from this page if your plans change.",
    };
  }

  if (status === "declined") {
    return {
      title: "Request declined",
      message:
        "The property owner did not accept this request. It was not confirmed.",
      nextStep:
        "You can send a new request from the property booking site if other dates are open.",
    };
  }

  const when = cancelledAtLabel ? ` on ${cancelledAtLabel}` : "";
  const actor =
    cancelledBy === "guest"
      ? "You cancelled this stay"
      : cancelledBy === "owner"
        ? "The property owner cancelled this stay"
        : "This stay was cancelled";

  return {
    title: "Reservation cancelled",
    message: `${actor}${when}.`,
    nextStep:
      cancelledBy === "guest"
        ? "The property owner has been notified. The dates are released on the property calendar. Hostvia does not process refunds."
        : "The dates are released on the property calendar. Hostvia does not process refunds. Contact the property owner if you still need the stay.",
  };
}

export function buildGuestReservationView(
  record: GuestReservationRecord | null,
  now = new Date()
): GuestReservationView {
  if (!record) return { state: "invalid" };
  if (isManageTokenExpired(record.expiresAt, now)) return { state: "expired" };

  const status = guestReservationStatus(record);
  const cancelledAt = record.cancelledAt ?? null;
  const cancelledAtLabel = cancelledAt ? formatTimestamp(cancelledAt) : null;
  const copy = statusCopy(status, record.cancelledBy ?? null, cancelledAtLabel);
  const rules = record.houseRules?.trim() || null;

  return {
    state: "active",
    reference: record.reference?.trim() || null,
    status,
    title: copy.title,
    message: copy.message,
    nextStep: copy.nextStep,
    propertyName: record.propertyName,
    propertyAddress: record.propertyAddress?.trim() || null,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    checkInLabel: formatStayDate(record.checkIn),
    checkOutLabel: formatStayDate(record.checkOut),
    guestCount: record.guestCount,
    guestCountLabel: guestCountLabel(record.guestCount),
    guestName: record.guestName,
    houseRules: rules ? rules.slice(0, 2000) : null,
    hostName: record.hostName?.trim() || null,
    hostEmail: record.hostEmail?.trim() || null,
    hostPhone: record.hostPhone?.trim() || null,
    canCancel: canGuestCancelReservation({
      status,
      checkOut: record.checkOut,
      now,
    }),
    cancelledAt,
    cancelledAtLabel,
    cancelledBy: record.cancelledBy ?? null,
  };
}
