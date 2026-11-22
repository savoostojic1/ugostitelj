import { NextResponse } from "next/server";
import { retryDueReservationNotifications } from "@/lib/notifications/send-reservation-event";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const maxDuration = 60;

function readProvidedSecret(request: Request): string | null {
  const headerSecret = request.headers.get("x-cron-secret")?.trim();
  if (headerSecret) return headerSecret;

  const authHeader = request.headers.get("authorization")?.trim();
  if (!authHeader) return null;

  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  return bearerMatch ? bearerMatch[1].trim() : authHeader;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured on the server" },
      { status: 500 }
    );
  }

  if (readProvidedSecret(request) !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await retryDueReservationNotifications();
    if (hasServiceRoleKey()) {
      // Housekeeping for the bot rate limiter; failure here must not fail the cron.
      const { error } = await createServiceClient().rpc("prune_public_endpoint_hits");
      if (error) console.error("[notification-retry] prune rate limits:", error.message);
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[notification-retry] failed");
    void error;
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
