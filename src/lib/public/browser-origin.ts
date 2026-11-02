import { getSiteBaseUrl } from "@/lib/public/site-url";

/**
 * Google Translate website proxy hosts pages at
 * `{encoded-host}.translate.goog`. The browser origin is then the proxy,
 * while Google still fetches the real Hostvia host server-side.
 */
export function isGoogleTranslateProxyHost(hostname: string): boolean {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  return host === "translate.goog" || host.endsWith(".translate.goog");
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
  if (!hostname || isGoogleTranslateProxyHost(hostname)) {
    return getSiteBaseUrl();
  }
  return origin || getSiteBaseUrl();
}

export function getBrowserHostname(
  hostname =
    typeof window !== "undefined" ? window.location.hostname : ""
): string {
  return hostname.split(":")[0]?.toLowerCase() ?? "";
}
