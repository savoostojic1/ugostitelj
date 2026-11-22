import { createHash } from "crypto";

export function hashClientIp(ip: string): string {
  return createHash("sha256").update(`hostvia-rate:${ip}`).digest("hex");
}

export function clientIpFromHeaders(headers: {
  get(name: string): string | null;
}): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** `hits` is the number of attempts already recorded in the window. */
export function rateLimitDecision(
  hits: number,
  limit: number
): "allow" | "deny" {
  if (limit < 1) return "deny";
  return hits < limit ? "allow" : "deny";
}

export const GUEST_CANCEL_LIMIT = 8;
export const GUEST_CANCEL_WINDOW_SECONDS = 60 * 60;
export const GUEST_VIEW_LIMIT = 40;
export const GUEST_VIEW_WINDOW_SECONDS = 10 * 60;

// Guest booking inquiries (public website form).
export const BOOKING_IP_LIMIT = 6;
export const BOOKING_IP_WINDOW_SECONDS = 60 * 60;
export const BOOKING_EMAIL_LIMIT = 4;
export const BOOKING_EMAIL_WINDOW_SECONDS = 24 * 60 * 60;

// Host sign-in / password reset through our own routes.
export const TEAM_LOGIN_IP_LIMIT = 10;
export const TEAM_LOGIN_USER_LIMIT = 8;
export const TEAM_LOGIN_WINDOW_SECONDS = 15 * 60;
export const PASSWORD_RESET_IP_LIMIT = 5;
export const PASSWORD_RESET_EMAIL_LIMIT = 3;
export const PASSWORD_RESET_WINDOW_SECONDS = 60 * 60;

// Platform admin panel.
export const ADMIN_LOGIN_IP_LIMIT = 5;
export const ADMIN_LOGIN_WINDOW_SECONDS = 15 * 60;
/** Across all IPs: caps distributed brute force on the single admin account. */
export const ADMIN_LOGIN_GLOBAL_LIMIT = 30;
export const ADMIN_LOGIN_GLOBAL_WINDOW_SECONDS = 60 * 60;
