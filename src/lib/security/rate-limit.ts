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
