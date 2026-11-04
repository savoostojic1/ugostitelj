"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectPushSubscription } from "@/lib/push/detect-subscription";
import { ensureServiceWorkerRegistration } from "@/lib/push/service-worker-registration";
import { urlBase64ToUint8Array } from "@/lib/push/url-base64";

type PushSupportState =
  | "unsupported"
  | "no-vapid"
  | "no-service-worker"
  | "ready"
  | "denied"
  | "subscribed";

type PushSubscriptionJson = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function loadVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch("/api/push/config", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      publicKey?: string | null;
      configured?: boolean;
    };
    return data.publicKey?.trim() || null;
  } catch {
    return null;
  }
}

async function loadServerDeviceSubscribed(): Promise<boolean | null> {
  try {
    const res = await fetch("/api/push/status", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { deviceSubscribed?: boolean };
    return data.deviceSubscribed === true;
  } catch {
    return null;
  }
}

function subscriptionJson(
  subscription: PushSubscription
): PushSubscriptionJson | null {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
}

async function readBrowserSubscription(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  let current = registration;

  try {
    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      sleep(2000).then(() => null),
    ]);
    if (ready?.pushManager) current = ready;
  } catch {
    // Fall back to the registration we already have.
  }

  for (const delay of [0, 400]) {
    if (delay) await sleep(delay);
    try {
      const subscription = await current.pushManager.getSubscription();
      if (subscription) return subscription;
    } catch {
      // iOS can throw while the installed app's worker is still settling.
    }
  }

  return null;
}

async function saveSubscription(
  subscription: PushSubscription,
  options: { silent: boolean }
): Promise<void> {
  const json = subscriptionJson(subscription);
  if (!json) throw new Error("Invalid push subscription");

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      silent: options.silent,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      typeof data.error === "string" ? data.error : "Could not enable notifications"
    );
  }
}

async function subscribeWithKey(
  registration: ServiceWorkerRegistration,
  publicKey: string
): Promise<PushSubscription> {
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });
}

export function usePushNotifications() {
  const [state, setState] = useState<PushSupportState>("ready");
  const [loading, setLoading] = useState(true);
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const requestId = useRef(0);
  const shownSubscribed = useRef(false);
  const syncedEndpoint = useRef<string | null>(null);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const id = ++requestId.current;
    if (!options?.silent) setLoading(true);

    const stillCurrent = () => id === requestId.current;

    try {
      if (!pushSupported()) {
        if (stillCurrent()) setState("unsupported");
        return;
      }

      const publicKey = await loadVapidPublicKey();
      if (!stillCurrent()) return;
      setVapidPublicKey(publicKey);

      if (!publicKey) {
        setState("no-vapid");
        return;
      }

      const permission = Notification.permission;
      if (permission === "denied") {
        shownSubscribed.current = false;
        setState("denied");
        return;
      }

      const registration = await ensureServiceWorkerRegistration();
      if (!stillCurrent()) return;
      if (!registration?.pushManager) {
        setState("no-service-worker");
        return;
      }

      const [existing, serverDeviceSubscribed] = await Promise.all([
        readBrowserSubscription(registration),
        loadServerDeviceSubscribed(),
      ]);
      if (!stillCurrent()) return;

      const decision = detectPushSubscription({
        supported: true,
        vapidReady: true,
        permission,
        serviceWorkerReady: true,
        browserSubscribed: Boolean(existing),
        rememberedOn:
          serverDeviceSubscribed === true ||
          (serverDeviceSubscribed === null && shownSubscribed.current),
        optedOut: false,
      });

      if (
        existing &&
        syncedEndpoint.current !== existing.endpoint
      ) {
        try {
          await saveSubscription(existing, { silent: true });
          if (stillCurrent()) syncedEndpoint.current = existing.endpoint;
        } catch {
          // The phone is still subscribed even if saving the endpoint failed.
        }
      }

      if (!stillCurrent()) return;
      if (decision === "subscribed") shownSubscribed.current = true;
      else if (serverDeviceSubscribed === false && !existing) {
        shownSubscribed.current = false;
      }
      setState(decision === "subscribed" ? "subscribed" : "ready");
    } catch {
      if (stillCurrent() && !shownSubscribed.current) setState("ready");
    } finally {
      if (stillCurrent()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const subscribe = useCallback(async () => {
    const id = ++requestId.current;
    const publicKey = vapidPublicKey ?? (await loadVapidPublicKey());
    if (!publicKey) {
      throw new Error("Push is not configured on the server yet");
    }

    if (!pushSupported()) {
      throw new Error("Push notifications are not available on this device");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      if (id === requestId.current) setState("denied");
      throw new Error("Notification permission denied");
    }

    const registration = await ensureServiceWorkerRegistration();
    if (!registration?.pushManager) {
      throw new Error("Could not start the app worker. Close and reopen the app.");
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await subscribeWithKey(registration, publicKey);
    }

    await saveSubscription(subscription, { silent: false });
    if (id === requestId.current) {
      syncedEndpoint.current = subscription.endpoint;
      shownSubscribed.current = true;
      setVapidPublicKey(publicKey);
      setState("subscribed");
      setLoading(false);
    }
  }, [vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    const id = ++requestId.current;
    const registration = await ensureServiceWorkerRegistration();
    const subscription = registration?.pushManager
      ? await registration.pushManager.getSubscription()
      : null;
    const endpoint = subscription?.endpoint ?? syncedEndpoint.current;

    if (subscription) {
      try {
        await subscription.unsubscribe();
      } catch {
        // iOS can drop the browser subscription while the server still has it.
      }
    }

    const res = await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        endpoint: endpoint ?? undefined,
        device: true,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "Could not turn off notifications"
      );
    }

    syncedEndpoint.current = null;
    shownSubscribed.current = false;
    if (id === requestId.current) {
      setState("ready");
      setLoading(false);
    }
  }, []);

  return {
    state,
    loading,
    subscribe,
    unsubscribe,
    refresh,
    isSubscribed: state === "subscribed",
    canSubscribe: state === "ready" || state === "no-service-worker",
  };
}
