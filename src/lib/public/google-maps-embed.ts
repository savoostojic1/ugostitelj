export function extractMapUrlFromInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.includes("<iframe")) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    return match?.[1]?.trim() ?? null;
  }

  const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) return urlMatch[0];

  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed.startsWith("http") ? trimmed : null;
}

export function isAllowedMapEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;

    if (
      parsed.hostname === "www.google.com" &&
      parsed.pathname.startsWith("/maps/embed")
    ) {
      return true;
    }

    if (
      (parsed.hostname === "maps.google.com" ||
        parsed.hostname === "www.google.com") &&
      parsed.searchParams.get("output") === "embed"
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

const MIN_EMBED_ZOOM = 1;
const MAX_EMBED_ZOOM = 21;
const DEFAULT_EMBED_ZOOM = 17;

function clampEmbedZoom(zoom: number): number {
  return Math.min(MAX_EMBED_ZOOM, Math.max(MIN_EMBED_ZOOM, Math.round(zoom)));
}

export function getEmbedZoom(url: string): number {
  try {
    const parsed = new URL(url);
    const z = parsed.searchParams.get("z");
    if (z) {
      const value = Number.parseFloat(z);
      if (Number.isFinite(value)) return clampEmbedZoom(value);
    }

    const pb = parsed.searchParams.get("pb");
    if (pb) {
      const pbZoom = pb.match(/!4f(\d+(?:\.\d+)?)/);
      if (pbZoom) {
        return clampEmbedZoom(Number.parseFloat(pbZoom[1]));
      }
    }
  } catch {
    // ignore
  }

  return DEFAULT_EMBED_ZOOM;
}

export function setEmbedZoom(url: string, zoom: number): string {
  const z = clampEmbedZoom(zoom);

  try {
    const parsed = new URL(url);

    if (
      parsed.searchParams.get("output") === "embed" ||
      parsed.searchParams.has("q")
    ) {
      parsed.searchParams.set("z", String(z));
      return parsed.toString();
    }

    const pb = parsed.searchParams.get("pb");
    if (pb && parsed.pathname.startsWith("/maps/embed")) {
      const updated = pb.includes("!4f")
        ? pb.replace(/!4f(\d+(?:\.\d+)?)/, `!4f${z}.1`)
        : `${pb}!4f${z}.1`;
      parsed.searchParams.set("pb", updated);
      return parsed.toString();
    }
  } catch {
    // ignore
  }

  return url;
}

export function isGoogleMapsShareUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "maps.app.goo.gl" || host === "goo.gl") return true;
    if (host === "g.co") return true;

    if (host === "google.com" || host.endsWith(".google.com")) {
      return (
        parsed.pathname.includes("/maps") ||
        parsed.searchParams.has("q") ||
        parsed.searchParams.has("query")
      );
    }

    return false;
  } catch {
    return false;
  }
}

interface MapPin {
  lat: string;
  lng: string;
  zoom: number;
}

function extractPbParameter(urlString: string): string | null {
  try {
    const parsed = new URL(urlString);
    const fromQuery = parsed.searchParams.get("pb");
    if (fromQuery) return fromQuery;
  } catch {
    // fall through to regex
  }

  const match = urlString.match(/[?&]pb=(!?[^&\s]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function extractPlaceLabel(href: string): string | undefined {
  const placeMatch = href.match(/\/maps\/place\/([^/@?]+)/);
  if (!placeMatch) return undefined;

  return decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
}

function extractZoom(href: string): number {
  const zMatch = href.match(/,(\d+(?:\.\d+)?)z/);
  if (!zMatch) return 17;
  return Math.min(21, Math.max(1, Math.round(Number.parseFloat(zMatch[1]))));
}

const COORD_PAIR =
  String.raw`(-?\d+(?:\.\d+)?)\s*,\s*\+?(-?\d+(?:\.\d+)?)`;

function parseCoordPair(value: string): { lat: string; lng: string } | null {
  const match = value.trim().match(new RegExp(`^${COORD_PAIR}$`));
  if (!match) return null;
  return { lat: match[1], lng: match[2] };
}

/**
 * Pin koordinate:
 * - !8m2!3d!4d = tačan place pin (prioritet)
 * - zadnji !3d!4d = pin (prvi često pripada drugom kontekstu u data=)
 * - @ = samo centar kamere (fallback)
 */
function extractMapPin(resolvedUrl: string): MapPin | null {
  const href = resolvedUrl;
  const zoom = extractZoom(href);

  const placePins = [
    ...href.matchAll(/!8m2!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g),
  ];
  const placePin = placePins.at(-1);
  if (placePin) {
    return { lat: placePin[1], lng: placePin[2], zoom };
  }

  const pinMatches = [
    ...href.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g),
  ];
  const pinMatch = pinMatches.at(-1);
  if (pinMatch) {
    return { lat: pinMatch[1], lng: pinMatch[2], zoom };
  }

  try {
    const url = new URL(href);
    const ll = url.searchParams.get("ll");
    if (ll) {
      const coords = parseCoordPair(ll);
      if (coords) return { ...coords, zoom };
    }

    const q = url.searchParams.get("q") ?? url.searchParams.get("query");
    if (q) {
      const coords = parseCoordPair(decodeURIComponent(q.replace(/\+/g, " ")));
      if (coords) return { ...coords, zoom };
    }
  } catch {
    // continue
  }

  const searchMatch = href.match(
    new RegExp(`/maps/search/${COORD_PAIR}`, "i")
  );
  if (searchMatch) {
    return { lat: searchMatch[1], lng: searchMatch[2], zoom };
  }

  const dirMatch = href.match(
    new RegExp(`/maps/dir/[^@]*/${COORD_PAIR}`, "i")
  );
  if (dirMatch) {
    return { lat: dirMatch[1], lng: dirMatch[2], zoom };
  }

  const atMatch = href.match(
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?)z)?/
  );
  if (atMatch) {
    return {
      lat: atMatch[1],
      lng: atMatch[2],
      zoom: atMatch[3]
        ? Math.min(21, Math.max(1, Math.round(Number.parseFloat(atMatch[3]))))
        : zoom,
    };
  }

  return null;
}

function buildPbEmbed(pb: string): string {
  return `https://www.google.com/maps/embed?pb=${encodeURIComponent(pb)}`;
}

function buildPinEmbed(pin: MapPin): string {
  // Coordinates-only query keeps the marker on the exact pin.
  // Place names in `q` make Google re-geocode and often shift the marker.
  const query = `${pin.lat},${pin.lng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&ll=${pin.lat},${pin.lng}&z=${pin.zoom}&hl=en&output=embed`;
}

/** Pretvara već razriješeni Google Maps URL u iframe embed. */
export function googleMapsUrlToEmbed(resolvedUrl: string): string | null {
  if (isAllowedMapEmbedUrl(resolvedUrl)) {
    return resolvedUrl;
  }

  const pb = extractPbParameter(resolvedUrl);
  if (pb) {
    return buildPbEmbed(pb);
  }

  const pin = extractMapPin(resolvedUrl);
  if (pin) {
    return buildPinEmbed(pin);
  }

  try {
    const url = new URL(resolvedUrl);
    const q =
      url.searchParams.get("q") ??
      url.searchParams.get("query") ??
      extractPlaceLabel(resolvedUrl);

    if (q) {
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=17&hl=en&output=embed`;
    }
  } catch {
    return null;
  }

  return null;
}

const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const DESKTOP_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function isShortMapLink(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "maps.app.goo.gl" || host === "goo.gl" || host === "g.co";
  } catch {
    return false;
  }
}

export async function followRedirects(url: string): Promise<string> {
  const userAgent = isShortMapLink(url) ? MOBILE_USER_AGENT : DESKTOP_USER_AGENT;

  let current = url;
  for (let i = 0; i < 10; i++) {
    const response = await fetch(current, {
      method: "HEAD",
      redirect: "manual",
      headers: {
        "User-Agent": userAgent,
        Accept: "*/*",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) break;
      current = new URL(location, current).toString();
      if (!isShortMapLink(current)) return current;
      continue;
    }

    if (response.status >= 200 && response.status < 300) {
      return current;
    }

    break;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "sr,en;q=0.9",
      },
    });

    if (response.url && response.url !== "about:blank") {
      return response.url;
    }
  } catch {
    // ignore
  }

  return current;
}

export async function resolveGoogleMapsInput(input: string): Promise<string | null> {
  const extracted = extractMapUrlFromInput(input);
  if (!extracted) return null;

  if (isAllowedMapEmbedUrl(extracted)) {
    return extracted;
  }

  let candidate = extracted;
  if (isGoogleMapsShareUrl(extracted)) {
    try {
      candidate = await followRedirects(extracted);
    } catch {
      return null;
    }
  }

  return googleMapsUrlToEmbed(candidate);
}

export function parseGoogleMapsEmbedUrl(input: string): string | null {
  const extracted = extractMapUrlFromInput(input);
  if (!extracted) return null;

  if (isAllowedMapEmbedUrl(extracted)) {
    return extracted;
  }

  return googleMapsUrlToEmbed(extracted);
}
