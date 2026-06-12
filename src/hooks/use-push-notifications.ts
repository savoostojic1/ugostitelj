"use client";

import { useCallback, useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push/url-base64";

type PushSupportState =
  | "loading"
  | "unsupported"
  | "no-vapid"
  | "ready"
  | "denied"
  | "subscribed";

function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function loadVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch("/api/push/config");
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

export function usePushNotifications() {
  const [state, setState] = useState<PushSupportState>("loading");
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setState("loading");

    if (!pushSupported()) {
      setState("unsupported");
      return;
    }

    const publicKey = await loadVapidPublicKey();
    setVapidPublicKey(publicKey);

    if (!publicKey) {
      setState("no-vapid");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setState(existing ? "subscribed" : "ready");
    } catch {
      setState("ready");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const subscribe = useCallback(async () => {
    const publicKey = vapidPublicKey ?? (await loadVapidPublicKey());
    if (!publicKey) {
      throw new Error("Push is not configured on the server yet");
    }

    if (!pushSupported()) {
      throw new Error("Push notifications are not available on this device");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState("denied");
      throw new Error("Notification permission denied");
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      throw new Error("Invalid push subscription");
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "Could not enable notifications"
      );
    }

    setVapidPublicKey(publicKey);
    setState("subscribed");
  }, [vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    }

    setState("ready");
  }, []);

  return {
    state,
    loading: state === "loading",
    subscribe,
    unsubscribe,
    refresh,
    isSubscribed: state === "subscribed",
    canSubscribe: state === "ready",
  };
}
