import { NextResponse } from "next/server";
import {
  isUuid,
  mapBookingRequestRpcError,
} from "@/lib/booking-requests/rpc-error";
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

  const { error } = await supabase.rpc("reject_booking_request", {
    p_request_id: id,
  });

  if (error) {
    console.error("[booking-requests] reject failed");
    const mapped = mapBookingRequestRpcError(error.message);
    return NextResponse.json(
      { ok: false, error: mapped.error },
      { status: mapped.status }
    );
  }

  return NextResponse.json({ ok: true });
}
