import { NextResponse } from "next/server";
import {
  BOOKING_DOMAIN,
  bookingSubdomainsEnabled,
} from "@/lib/public/booking-site-url";
import { getSiteBaseUrl } from "@/lib/public/site-url";

export async function GET() {
  return NextResponse.json(
    {
      useSubdomain: bookingSubdomainsEnabled(),
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
