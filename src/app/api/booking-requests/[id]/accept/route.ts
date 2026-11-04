import { NextResponse } from "next/server";
import {
  isUuid,
  mapBookingRequestRpcError,
} from "@/lib/booking-requests/rpc-error";
import { channelResult } from "@/lib/notifications/dispatch";
import { dispatchReservationEvent } from "@/lib/notifications/send-reservation-event";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("accept_booking_request", {
    p_request_id: id,
  });

  if (error) {
    console.error("[booking-requests] accept failed");
    const mapped = mapBookingRequestRpcError(error.message);
    return NextResponse.json(
      { ok: false, error: mapped.error },
      { status: mapped.status }
    );
  }

  let guestEmail: "sent" | "failed" | "skipped" | "duplicate" = "skipped";
  try {
    const dispatched = await dispatchReservationEvent(id, "confirmed");
    guestEmail = channelResult(dispatched.results, "email_guest");
  } catch (notifyError) {
    console.error("[booking-requests] confirmation notification failed");
    void notifyError;
    guestEmail = "failed";
  }

  return NextResponse.json({
    ok: true,
    reservationId: data ? String(data) : null,
    guestEmail,
  });
}
