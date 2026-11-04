import { completeBookingRequest } from "@/lib/booking-requests/complete";
import { parseBookingRequestBody } from "@/lib/booking-requests/validate";
import { channelResult } from "@/lib/notifications/dispatch";
import { dispatchReservationEvent } from "@/lib/notifications/send-reservation-event";
import {
  jsonWithPublicCors,
  publicApiOptionsResponse,
} from "@/lib/public/public-api-cors";
import { attachGuestAccess } from "@/lib/reservations/attach-guest-access";
import { createClient } from "@/lib/supabase/server";

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

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonWithPublicCors(
        request,
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = parseBookingRequestBody(json);
    if (!parsed.ok) {
      return jsonWithPublicCors(
        request,
        { ok: false, error: parsed.error },
        { status: parsed.status }
      );
    }

    const input = parsed.value;
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_booking_request", {
      p_property_slug: input.propertySlug,
      p_guest_name: input.guestName,
      p_email: input.email,
      p_phone: input.phone,
      p_check_in: input.checkIn,
      p_check_out: input.checkOut,
      p_guest_count: input.guestCount,
      p_message: input.message,
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
    const completed = await completeBookingRequest(requestId, {
      attach: () => attachGuestAccess(requestId),
      notify: async (token) => {
        const dispatched = await dispatchReservationEvent(
          requestId,
          "request_received",
          { manageToken: token }
        );
        return {
          emailSent:
            channelResult(dispatched.results, "email_guest") === "sent" ||
            channelResult(dispatched.results, "email_guest") === "duplicate",
        };
      },
    });

    return jsonWithPublicCors(request, completed);
  } catch (err) {
    console.error("[booking-requests] unexpected error:", err);
    return jsonWithPublicCors(
      request,
      { ok: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
