import { NextResponse } from "next/server";
import {
  isMissingRpc,
  isUuid,
  mapBookingRequestRpcError,
} from "@/lib/booking-requests/rpc-error";
import { channelResult } from "@/lib/notifications/dispatch";
import { dispatchReservationEvent } from "@/lib/notifications/send-reservation-event";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

type CancelPayload = {
  outcome?: string;
  booking_request_id?: string;
  cancelled_at?: string;
};

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid reservation" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("owner_cancel_reservation", {
    p_reservation_id: id,
  });

  if (error && isMissingRpc(error.message, "owner_cancel_reservation")) {
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("id, is_manual, property_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !reservation?.is_manual) {
      return NextResponse.json(
        { ok: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id")
      .eq("id", reservation.property_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (propertyError || !property) {
      return NextResponse.json(
        { ok: false, error: "You do not have permission to update this reservation." },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[reservations] fallback delete failed");
      return NextResponse.json(
        { ok: false, error: "Could not update this reservation." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      outcome: "deleted",
      guestEmail: "skipped",
    });
  }

  if (error) {
    console.error("[reservations] owner cancel failed");
    const mapped = mapBookingRequestRpcError(error.message);
    return NextResponse.json(
      { ok: false, error: mapped.error },
      { status: mapped.status }
    );
  }

  const payload = (data ?? {}) as CancelPayload;
  if (payload.outcome === "not_found") {
    return NextResponse.json(
      { ok: false, error: "Reservation not found" },
      { status: 404 }
    );
  }

  let guestEmail: "sent" | "failed" | "skipped" | "duplicate" = "skipped";
  if (payload.outcome === "cancelled" && payload.booking_request_id) {
    try {
      const dispatched = await dispatchReservationEvent(
        payload.booking_request_id,
        "cancelled_by_owner"
      );
      guestEmail = channelResult(dispatched.results, "email_guest");
    } catch (notifyError) {
      console.error("[reservations] cancellation notification failed");
      void notifyError;
      guestEmail = "failed";
    }
  }

  return NextResponse.json({
    ok: true,
    outcome: payload.outcome ?? "deleted",
    guestEmail,
  });
}
