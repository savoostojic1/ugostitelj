import { NextResponse } from "next/server";
import {
  BOOKING_DOMAIN,
  bookingSubdomainsEnabled,
} from "@/lib/public/booking-site-url";
import { getSiteBaseUrl } from "@/lib/public/site-url";

function useSubdomainForHost(host: string | null): boolean {
  if (bookingSubdomainsEnabled()) return true;

  const hostname = host?.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || hostname.includes("localhost")) return false;
  if (hostname.endsWith(".vercel.app")) return false;

  const domain = BOOKING_DOMAIN.toLowerCase();
  return hostname === domain || hostname === `www.${domain}`;
}

export async function GET(request: Request) {
  const host = request.headers.get("host");

  return NextResponse.json(
    {
      useSubdomain: useSubdomainForHost(host),
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
