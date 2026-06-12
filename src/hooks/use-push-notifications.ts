"use client";

import { useCallback, useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push/url-base64";
import { getVapidPublicKey } from "@/lib/push/vapid";

type PushSupportState =
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

export function usePushNotifications() {
  const [state, setState] = useState<PushSupportState>("unsupported");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!pushSupported()) {
      setState("unsupported");
      setLoading(false);
      return;
    }

    if (!getVapidPublicKey()) {
      setState("no-vapid");
      setLoading(false);
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      setLoading(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setState(existing ? "subscribed" : "ready");
    } catch {
      setState("ready");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const subscribe = useCallback(async () => {
    const vapidKey = getVapidPublicKey();
    if (!vapidKey || !pushSupported()) {
      throw new Error("Push notifications are not available");
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
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
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
        typeof data.error === "string" ? data.error : "Could not enable notifications"
      );
    }

    setState("subscribed");
  }, []);

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
    loading,
    subscribe,
    unsubscribe,
    refresh,
    isSubscribed: state === "subscribed",
    canSubscribe: state === "ready",
  };
}
