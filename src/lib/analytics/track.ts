const INTERNAL_KEY = "hostvia_traffic_scope";

type EventParams = Record<string, string | number | boolean>;

type Gtag = (
  command: "event",
  name: string,
  params?: EventParams
) => void;

function readGtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const candidate = (window as Window & { gtag?: Gtag }).gtag;
  return typeof candidate === "function" ? candidate : null;
}

export function markInternalTraffic() {
  try {
    window.localStorage.setItem(INTERNAL_KEY, "internal");
  } catch {
    // Storage can be blocked. Tracking still works without the flag.
  }
}

export function clearInternalTraffic() {
  try {
    window.localStorage.removeItem(INTERNAL_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function trafficScope(): "internal" | "external" {
  try {
    return window.localStorage.getItem(INTERNAL_KEY) === "internal"
      ? "internal"
      : "external";
  } catch {
    return "external";
  }
}

export function trackHostviaEvent(name: string, params?: EventParams) {
  try {
    const gtag = readGtag();
    if (!gtag) return;
    gtag("event", name, {
      ...params,
      traffic_scope: trafficScope(),
    });
  } catch {
    // Analytics must not block sign-up, checkout, or calendar save.
  }
}

export function trackOncePerSession(name: string, params?: EventParams) {
  const storageKey = `hv_evt_${name}`;
  try {
    if (window.sessionStorage.getItem(storageKey) === "1") return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // If storage is blocked, still send the event once for this call.
  }
  trackHostviaEvent(name, params);
}
