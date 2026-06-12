import { getSiteBaseUrl } from "@/lib/public/site-url";
import { isValidUsername } from "@/lib/public/slug";

export const BOOKING_DOMAIN =
  process.env.NEXT_PUBLIC_BOOKING_DOMAIN ?? "hostvia.me";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "mail",
  "smtp",
  "staging",
  "dev",
  "test",
]);

export function isReservedBookingSubdomain(username: string): boolean {
  return RESERVED_SUBDOMAINS.has(username.toLowerCase());
}

export function usesBookingSubdomain(baseUrl?: string): boolean {
  const base = (baseUrl ?? getSiteBaseUrl()).toLowerCase();
  if (base.includes("localhost")) return false;
  if (base.includes(".vercel.app")) return false;
  return true;
}

export function getBookingSitePath(username: string): string {
  const clean = username.trim().toLowerCase();
  return clean ? `/host/${clean}` : "";
}

export function getBookingSiteUrl(
  username: string,
  options?: { baseUrl?: string }
): string | null {
  const clean = username.trim().toLowerCase();
  if (!clean || !isValidUsername(clean)) return null;

  const base = options?.baseUrl ?? getSiteBaseUrl();

  if (usesBookingSubdomain(base)) {
    return `https://${clean}.${BOOKING_DOMAIN}`;
  }

  return `${base.replace(/\/$/, "")}${getBookingSitePath(clean)}`;
}

export function getBookingSiteLabel(
  username: string,
  options?: { baseUrl?: string }
): string | null {
  const url = getBookingSiteUrl(username, options);
  if (!url) return null;

  if (usesBookingSubdomain(options?.baseUrl)) {
    const clean = username.trim().toLowerCase();
    return `${clean}.${BOOKING_DOMAIN}`;
  }

  try {
    return new URL(url).host + new URL(url).pathname;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function parseBookingSubdomain(host: string): string | null {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || hostname === "localhost") return null;
  if (hostname === BOOKING_DOMAIN || hostname === `www.${BOOKING_DOMAIN}`) {
    return null;
  }

  const suffix = `.${BOOKING_DOMAIN}`;
  if (!hostname.endsWith(suffix)) return null;

  const subdomain = hostname.slice(0, -suffix.length);
  if (!subdomain || subdomain.includes(".")) return null;
  if (isReservedBookingSubdomain(subdomain)) return null;
  if (!isValidUsername(subdomain)) return null;

  return subdomain;
}
