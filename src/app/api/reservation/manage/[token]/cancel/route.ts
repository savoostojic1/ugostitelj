import { NextResponse } from "next/server";
import { hashManageToken, isManageTokenShape } from "@/lib/reservations/guest-access";
import { dispatchReservationEvent } from "@/lib/notifications/send-reservation-event";
import { consumePublicRateLimit } from "@/lib/security/consume-rate-limit";
import {
  clientIpFromHeaders,
  GUEST_CANCEL_LIMIT,
  GUEST_CANCEL_WINDOW_SECONDS,
} from "@/lib/security/rate-limit";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

interface RouteParams {
  params: Promise<{ token: string }>;
}

type CancelPayload = {
  outcome?: string;
  booking_request_id?: string;
  cancelled_at?: string;
};

const INVALID = {
  ok: false,
  error:
    "This link is not valid. Contact the property owner if you need help with your stay.",
};

export async function POST(request: Request, { params }: RouteParams) {
  const { token } = await params;
  if (!isManageTokenShape(token)) {
    return NextResponse.json(INVALID, { status: 404 });
  }

  const limited = await consumePublicRateLimit(
    "guest-cancel",
    clientIpFromHeaders(request.headers),
    GUEST_CANCEL_LIMIT,
    GUEST_CANCEL_WINDOW_SECONDS
  );

  if (limited === "deny") {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many attempts. Wait a few minutes and try again.",
      },
      { status: 429 }
    );
  }

  if (limited === "unavailable") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cancellation is temporarily unavailable. Your reservation was not changed.",
      },
      { status: 503 }
    );
  }

  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cancellation is temporarily unavailable. Your reservation was not changed.",
      },
      { status: 503 }
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("guest_cancel_booking_request", {
    p_token_hash: hashManageToken(token),
  });

  if (error) {
    console.error("[reservation-manage] cancel failed");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cancellation is temporarily unavailable. Your reservation was not changed.",
      },
      { status: 503 }
    );
  }

  const payload = (data ?? {}) as CancelPayload;

  if (payload.outcome === "invalid") {
    return NextResponse.json(INVALID, { status: 404 });
  }

  if (payload.outcome === "expired") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This link has expired. Contact the property owner to check your reservation.",
      },
      { status: 410 }
    );
  }

  if (
    payload.outcome === "declined" ||
    payload.outcome === "not_cancellable"
  ) {
    return NextResponse.json(
      { ok: false, error: "This reservation can no longer be cancelled." },
      { status: 409 }
    );
  }

  if (payload.outcome === "cancelled" && payload.booking_request_id) {
    try {
      await dispatchReservationEvent(
        payload.booking_request_id,
        "cancelled_by_guest",
        { manageToken: token }
      );
    } catch (notifyError) {
      console.error("[reservation-manage] notification failed");
      void notifyError;
    }
  }

  return NextResponse.json({
    ok: true,
    outcome: payload.outcome === "already_cancelled" ? "already_cancelled" : "cancelled",
    cancelledAt: payload.cancelled_at ?? null,
  });
}
