export type PushPermission = "default" | "granted" | "denied" | "unknown";
export type PushLocalChoice = "on" | "off" | null;

export type PushDetectionInput = {
  supported: boolean;
  vapidReady: boolean;
  permission: PushPermission;
  serviceWorkerReady: boolean;
  /** PushManager.getSubscription() returned a subscription. */
  browserSubscribed: boolean;
  /** This device already opted in, even if the browser hid the subscription. */
  rememberedOn: boolean;
  /** User turned notifications off on this device. */
  optedOut: boolean;
};

/**
 * iOS home-screen apps often keep delivering pushes while
 * PushManager.getSubscription() returns null. Permission alone cannot
 * decide: it stays "granted" after the user turns notifications off.
 */
export type PushDetectionStatus =
  | "unsupported"
  | "no-vapid"
  | "no-service-worker"
  | "denied"
  | "ready"
  | "subscribed";

export function pushDeviceKind(
  userAgent: string
): "iphone" | "ipad" | "android" | null {
  if (/iPad/.test(userAgent)) return "ipad";
  if (/iPhone|iPod/.test(userAgent)) return "iphone";
  if (/Android/.test(userAgent)) return "android";
  return null;
}

/**
 * Exact user-agent match, or the only stored phone of the same type.
 * iOS changes the user agent on each system update, while getSubscription()
 * still often returns nothing.
 */
export function matchingStoredUserAgents(
  storedUserAgents: Array<string | null | undefined>,
  currentUserAgent: string
): string[] {
  const current = currentUserAgent.trim();
  if (!current) return [];

  const stored = storedUserAgents
    .map((userAgent) => userAgent?.trim() || "")
    .filter(Boolean);
  const exact = stored.filter((userAgent) => userAgent === current);
  if (exact.length > 0) return [...new Set(exact)];

  const kind = pushDeviceKind(current);
  if (!kind) return [];

  const sameKind = stored.filter((userAgent) => pushDeviceKind(userAgent) === kind);
  return sameKind.length === 1 ? sameKind : [];
}

export function detectPushSubscription(
  input: PushDetectionInput
): PushDetectionStatus {
  if (!input.supported) return "unsupported";
  if (!input.vapidReady) return "no-vapid";
  if (input.permission === "denied") return "denied";
  if (!input.serviceWorkerReady) return "no-service-worker";
  if (input.browserSubscribed) return "subscribed";
  if (input.optedOut) return "ready";
  if (input.rememberedOn) return "subscribed";
  return "ready";
}
