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

/** Subdomain booking URLs need wildcard DNS (*.hostvia.me) on Vercel. */
export function bookingSubdomainsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BOOKING_USE_SUBDOMAIN === "true";
}

export type BookingSiteUrlOptions = {
  baseUrl?: string;
  useSubdomain?: boolean;
  bookingDomain?: string;
};

function resolveUseSubdomain(
  baseUrl: string,
  useSubdomain?: boolean
): boolean {
  const enabled = useSubdomain ?? bookingSubdomainsEnabled();
  if (!enabled) return false;

  const base = baseUrl.toLowerCase();
  if (base.includes("localhost")) return false;
  if (base.includes(".vercel.app")) return false;
  return true;
}

export function usesBookingSubdomain(
  baseUrl?: string,
  options?: Pick<BookingSiteUrlOptions, "useSubdomain">
): boolean {
  return resolveUseSubdomain(baseUrl ?? getSiteBaseUrl(), options?.useSubdomain);
}

export function getBookingSitePath(username: string): string {
  const clean = username.trim().toLowerCase();
  return clean ? `/host/${clean}` : "";
}

export function getBookingSiteUrl(
  username: string,
  options?: BookingSiteUrlOptions
): string | null {
  const clean = username.trim().toLowerCase();
  if (!clean || !isValidUsername(clean)) return null;

  const base = options?.baseUrl ?? getSiteBaseUrl();
  const bookingDomain = options?.bookingDomain ?? BOOKING_DOMAIN;

  if (resolveUseSubdomain(base, options?.useSubdomain)) {
    return `https://${clean}.${bookingDomain}`;
  }

  return `${base.replace(/\/$/, "")}${getBookingSitePath(clean)}`;
}

export function getBookingSiteLabel(
  username: string,
  options?: BookingSiteUrlOptions
): string | null {
  const url = getBookingSiteUrl(username, options);
  if (!url) return null;

  const bookingDomain = options?.bookingDomain ?? BOOKING_DOMAIN;

  if (resolveUseSubdomain(options?.baseUrl ?? getSiteBaseUrl(), options?.useSubdomain)) {
    const clean = username.trim().toLowerCase();
    return `${clean}.${bookingDomain}`;
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
