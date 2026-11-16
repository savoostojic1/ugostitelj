import { NextResponse } from "next/server";
import { BOOKING_DOMAIN, bookingSubdomainsForHost } from "@/lib/public/booking-site-url";
import { getSiteBaseUrl } from "@/lib/public/site-url";

export async function GET(request: Request) {
  const host = request.headers.get("host");

  return NextResponse.json(
    {
      useSubdomain: bookingSubdomainsForHost(host),
      bookingDomain: BOOKING_DOMAIN,
      siteBaseUrl: getSiteBaseUrl(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
