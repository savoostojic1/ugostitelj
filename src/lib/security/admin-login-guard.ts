import "server-only";

import { consumeRateLimits } from "@/lib/security/consume-rate-limit";
import {
  ADMIN_LOGIN_GLOBAL_LIMIT,
  ADMIN_LOGIN_GLOBAL_WINDOW_SECONDS,
  ADMIN_LOGIN_IP_LIMIT,
  ADMIN_LOGIN_WINDOW_SECONDS,
  clientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export type AdminGuardResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

/** Rate limit (per IP and across all IPs) plus captcha for admin sign-in/setup. */
export async function guardAdminAttempt(
  request: Request,
  captchaToken: unknown
): Promise<AdminGuardResult> {
  const ip = clientIpFromHeaders(request.headers);

  const limited = await consumeRateLimits([
    {
      action: "admin_login_ip",
      key: ip,
      limit: ADMIN_LOGIN_IP_LIMIT,
      windowSeconds: ADMIN_LOGIN_WINDOW_SECONDS,
    },
    {
      action: "admin_login_global",
      key: "all",
      limit: ADMIN_LOGIN_GLOBAL_LIMIT,
      windowSeconds: ADMIN_LOGIN_GLOBAL_WINDOW_SECONDS,
    },
  ]);
  if (limited === "deny") {
    console.warn("[admin-login] rate limited");
    return {
      ok: false,
      status: 429,
      error: "Too many attempts. Wait 15 minutes and try again.",
    };
  }

  const captcha = await verifyTurnstileToken(captchaToken, ip);
  if (captcha === "fail") {
    return {
      ok: false,
      status: 400,
      error: "Security check failed. Reload the page and try again.",
    };
  }

  return { ok: true };
}

/** Slows down password guessing without leaking timing about which part failed. */
export function failedAttemptDelay(): Promise<void> {
  const ms = 600 + Math.floor(Math.random() * 400);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
