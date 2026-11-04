export type BookingRequestInput = {
  propertySlug: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  message: string | null;
};

function isIsoDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseBookingRequestBody(
  body: unknown
):
  | { ok: true; value: BookingRequestInput }
  | { ok: false; status: number; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "Invalid JSON body" };
  }

  const value = body as Record<string, unknown>;
  const propertySlug =
    typeof value.propertySlug === "string" ? value.propertySlug.trim() : "";
  const guestName =
    typeof value.guestName === "string" ? value.guestName.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const phone = typeof value.phone === "string" ? value.phone.trim() : "";
  const checkIn = typeof value.checkIn === "string" ? value.checkIn : "";
  const checkOut = typeof value.checkOut === "string" ? value.checkOut : "";
  const message =
    typeof value.message === "string" && value.message.trim()
      ? value.message.trim()
      : null;

  if (!propertySlug || !guestName || !email || !phone || !checkIn || !checkOut) {
    return {
      ok: false,
      status: 400,
      error: "Please fill in all required fields",
    };
  }

  if (!isIsoDateOnly(checkIn) || !isIsoDateOnly(checkOut)) {
    return { ok: false, status: 400, error: "Invalid dates" };
  }

  if (checkOut <= checkIn) {
    return {
      ok: false,
      status: 400,
      error: "Check-out must be after check-in",
    };
  }

  const guestCount =
    value.guestCount === undefined || value.guestCount === null
      ? 1
      : Number(value.guestCount);

  if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 100) {
    return { ok: false, status: 400, error: "Invalid guest count" };
  }

  return {
    ok: true,
    value: {
      propertySlug,
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guestCount,
      message,
    },
  };
}
