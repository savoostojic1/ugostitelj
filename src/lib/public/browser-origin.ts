import { BOOKING_DOMAIN, parseBookingSubdomain } from "@/lib/public/booking-site-url";
import { getSiteBaseUrl } from "@/lib/public/site-url";

/**
 * Google Translate website proxy hosts pages at
 * `{encoded-host}.translate.goog`. The browser origin is then the proxy,
 * while Google still fetches the real Hostvia host server-side.
 *
 * Encoding (Google): `.` → `-`, `-` → `--`
 */
export function isGoogleTranslateProxyHost(hostname: string): boolean {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  return host === "translate.goog" || host.endsWith(".translate.goog");
}

/**
 * Reverse Google Translate's host encoding.
 * Returns null when the label is missing or cannot be decoded safely.
 */
export function decodeGoogleTranslateProxyHost(
  hostname: string
): string | null {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  if (!host.endsWith(".translate.goog")) return null;

  const encoded = host.slice(0, -".translate.goog".length);
  if (!encoded || encoded.includes(".")) return null;

  const decoded = encoded.replace(/--/g, "\u0000").replace(/-/g, ".").replace(/\u0000/g, "-");

  if (!decoded || decoded.includes("..") || decoded.startsWith(".") || decoded.endsWith(".")) {
    return null;
  }

  return decoded;
}

function siteHostname(): string {
  try {
    return new URL(getSiteBaseUrl()).hostname.toLowerCase();
  } catch {
    return "hostvia.me";
  }
}

/**
 * Only allow decoded hosts that belong to Hostvia (apex, www, or a booking
 * subdomain). Never used for auth or tenant authorization.
 */
export function isAllowedHostviaHostname(hostname: string): boolean {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  if (!host) return false;

  const site = siteHostname();
  if (host === site || host === `www.${site}`) return true;
  if (host === BOOKING_DOMAIN || host === `www.${BOOKING_DOMAIN}`) return true;
  if (parseBookingSubdomain(host)) return true;

  return false;
}

/**
 * Client-facing absolute origin for links, OAuth redirects, calendar export
 * URLs, and booking site previews. Never returns a translate.goog origin.
 */
export function getBrowserPublicOrigin(
  hostname =
    typeof window !== "undefined" ? window.location.hostname : "",
  origin =
    typeof window !== "undefined" ? window.location.origin : ""
): string {
  if (!hostname) return getSiteBaseUrl();

  if (isGoogleTranslateProxyHost(hostname)) {
    const decoded = decodeGoogleTranslateProxyHost(hostname);
    if (decoded && isAllowedHostviaHostname(decoded)) {
      return `https://${decoded}`;
    }
    return getSiteBaseUrl();
  }

  return origin || getSiteBaseUrl();
}

/**
 * Origin for public booking API calls. Same-origin relative URLs are preferred
 * off the Translate proxy; on translate.goog we target the real Hostvia host.
 */
export function getPublicApiOrigin(
  hostname =
    typeof window !== "undefined" ? window.location.hostname : ""
): string {
  if (!hostname || !isGoogleTranslateProxyHost(hostname)) {
    return "";
  }
  return getBrowserPublicOrigin(hostname);
}

/** Build a public API URL that still works under the Google Translate proxy. */
export function resolvePublicApiUrl(
  path: string,
  hostname =
    typeof window !== "undefined" ? window.location.hostname : ""
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const origin = getPublicApiOrigin(hostname);
  return origin ? `${origin}${normalized}` : normalized;
}

export function getBrowserHostname(
  hostname =
    typeof window !== "undefined" ? window.location.hostname : ""
): string {
  return hostname.split(":")[0]?.toLowerCase() ?? "";
}

/** Whether a browser Origin header may call public booking APIs cross-origin. */
export function isAllowedPublicApiBrowserOrigin(originHeader: string): boolean {
  try {
    const originUrl = new URL(originHeader);
    if (originUrl.protocol !== "https:" && originUrl.protocol !== "http:") {
      return false;
    }
    if (isGoogleTranslateProxyHost(originUrl.hostname)) {
      const decoded = decodeGoogleTranslateProxyHost(originUrl.hostname);
      return Boolean(decoded && isAllowedHostviaHostname(decoded));
    }
    return isAllowedHostviaHostname(originUrl.hostname);
  } catch {
    return false;
  }
}
