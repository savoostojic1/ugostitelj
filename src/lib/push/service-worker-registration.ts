import { isBookingSubdomainHost } from "@/lib/public/booking-site-url";

const SW_URL = "/sw.js";
const READY_TIMEOUT_MS = 8000;

export async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  if (isBookingSubdomainHost(window.location.hostname)) {
    try {
      const existing = await navigator.serviceWorker.getRegistration();
      await existing?.unregister();
    } catch {
      // ignore — public booking sites should not run the dashboard SW
    }
    return null;
  }

  try {
    let registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      registration = await navigator.serviceWorker.register(SW_URL);
    }

    const readyRegistration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) =>
        window.setTimeout(() => resolve(null), READY_TIMEOUT_MS)
      ),
    ]);

    if (readyRegistration) return readyRegistration;

    if (registration.active) return registration;

    await new Promise<void>((resolve) => {
      const worker = registration.installing ?? registration.waiting;
      if (!worker) {
        resolve();
        return;
      }

      worker.addEventListener("statechange", () => {
        if (worker.state === "activated") resolve();
      });

      window.setTimeout(resolve, READY_TIMEOUT_MS);
    });

    return (await navigator.serviceWorker.getRegistration()) ?? registration;
  } catch (err) {
    console.error("[pwa] service worker setup failed", err);
    return null;
  }
}
