import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMarketingPublicPath } from "@/lib/marketing/content";
import { parseBookingSubdomain } from "@/lib/public/booking-site-url";
import {
  PWA_STANDALONE_COOKIE,
  isPwaBlockedPath,
} from "@/lib/pwa/standalone";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
    return NextResponse.next({ request });
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const host = request.headers.get("host") ?? "";
    const path = request.nextUrl.pathname;

    if (path === "/sw.js" || path === "/manifest.webmanifest") {
      return NextResponse.next({ request });
    }
    const isAuthRoute =
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/forgot-password");
    const bookingUsername = parseBookingSubdomain(host);

    if (
      bookingUsername &&
      !path.startsWith("/api/") &&
      !path.startsWith("/_next/") &&
      !path.startsWith("/dashboard") &&
      !isAuthRoute
    ) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/host/${bookingUsername}`;
      return NextResponse.rewrite(rewriteUrl);
    }
    const isPublicRoute =
      isMarketingPublicPath(path) ||
      isAuthRoute ||
      path.startsWith("/api/calendar") ||
      path.startsWith("/api/cron/") ||
      path.startsWith("/api/booking-requests") ||
      path.startsWith("/api/push/config") ||
      path.startsWith("/api/booking/config") ||
      path.startsWith("/api/public/") ||
      path.startsWith("/host/");

    const isPwaStandalone =
      request.cookies.get(PWA_STANDALONE_COOKIE)?.value === "1";
    const isPwaAllowedRoute =
      isAuthRoute ||
      path.startsWith("/dashboard") ||
      path.startsWith("/host/") ||
      Boolean(bookingUsername && (path === "/" || path === ""));

    if (
      isPwaStandalone &&
      !isPwaAllowedRoute &&
      isPwaBlockedPath(path, host)
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = user ? "/dashboard" : "/login";
      return NextResponse.redirect(redirectUrl);
    }

    if (!user && path.startsWith("/dashboard")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    if (user && isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    if (!user && !isPublicRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[middleware]", err);
    return NextResponse.next({ request });
  }
}
