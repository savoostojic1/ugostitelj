import { notifyHostOfBookingRequest } from "@/lib/notifications/send-booking-request-notification";
import {
  jsonWithPublicCors,
  publicApiOptionsResponse,
} from "@/lib/public/public-api-cors";
import { createClient } from "@/lib/supabase/server";

type BookingRequestBody = {
  propertySlug?: string;
  guestName?: string;
  email?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  guestCount?: number;
  message?: string;
};

function isIsoDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function OPTIONS(request: Request) {
  return publicApiOptionsResponse(request);
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonWithPublicCors(
        request,
        { ok: false, error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    let body: BookingRequestBody;
    try {
      body = (await request.json()) as BookingRequestBody;
    } catch {
      return jsonWithPublicCors(
        request,
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      propertySlug,
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guestCount,
      message,
    } = body;

    if (
      !propertySlug?.trim() ||
      !guestName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !checkIn ||
      !checkOut
    ) {
      return jsonWithPublicCors(
        request,
        { ok: false, error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    if (!isIsoDateOnly(checkIn) || !isIsoDateOnly(checkOut)) {
      return jsonWithPublicCors(
        request,
        { ok: false, error: "Invalid dates" },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return jsonWithPublicCors(
        request,
        { ok: false, error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    const guests = guestCount ?? 1;
    if (!Number.isFinite(guests) || guests < 1 || guests > 100) {
      return jsonWithPublicCors(
        request,
        { ok: false, error: "Invalid guest count" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_booking_request", {
      p_property_slug: propertySlug.trim(),
      p_guest_name: guestName.trim(),
      p_email: email.trim(),
      p_phone: phone.trim(),
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_guest_count: guests,
      p_message: message?.trim() ?? null,
    });

    if (error) {
      const msg = error.message.includes("not available")
        ? "The selected dates are not available"
        : error.message.includes("not found")
          ? "Property not found"
          : error.message.includes("Invalid date")
            ? "Invalid dates"
            : error.message.includes("Invalid guest")
              ? "Invalid guest count"
              : "Failed to submit request";
      return jsonWithPublicCors(
        request,
        { ok: false, error: msg },
        { status: 400 }
      );
    }

    if (!data) {
      console.error("[booking-requests] RPC returned no id");
      return jsonWithPublicCors(
        request,
        { ok: false, error: "Failed to submit request" },
        { status: 500 }
      );
    }

    const requestId = String(data);

    try {
      await notifyHostOfBookingRequest(requestId);
    } catch (err) {
      console.error("[booking-requests] notification failed:", err);
    }

    return jsonWithPublicCors(request, { ok: true, id: requestId });
  } catch (err) {
    console.error("[booking-requests] unexpected error:", err);
    return jsonWithPublicCors(
      request,
      { ok: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
