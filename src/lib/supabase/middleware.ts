import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMarketingPublicPath } from "@/lib/marketing/content";
import { parseBookingSubdomain } from "@/lib/public/booking-site-url";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/auth/password-recovery";

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

    if (
      path === "/reset-password" &&
      request.nextUrl.searchParams.has("code")
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/callback/recovery";
      return NextResponse.redirect(redirectUrl);
    }
    const isAuthRoute =
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/forgot-password");
    const isPasswordResetRoute = path.startsWith("/reset-password");
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
      isPasswordResetRoute ||
      path.startsWith("/auth/callback") ||
      path.startsWith("/api/calendar") ||
      path.startsWith("/api/cron/") ||
      path.startsWith("/api/booking-requests") ||
      path.startsWith("/api/push/config") ||
      path.startsWith("/api/booking/config") ||
      path.startsWith("/api/auth/team-login") ||
      path.startsWith("/api/auth/forgot-password") ||
      path.startsWith("/api/billing/webhook") ||
      path.startsWith("/api/admin/") ||
      path.startsWith("/admin") ||
      path.startsWith("/api/public/") ||
      path.startsWith("/host/");

    const recoveryPending =
      request.cookies.get(PASSWORD_RECOVERY_COOKIE)?.value === "1";

    if (
      user &&
      recoveryPending &&
      path.startsWith("/dashboard") &&
      !isPasswordResetRoute
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/reset-password";
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
