/// Hostvia PWA service worker — install + push notifications
const CACHE = "hostvia-v5";
const DEFAULT_PATH = "/dashboard/booking-requests";

function toAppPath(url) {
  if (!url || typeof url !== "string") return DEFAULT_PATH;

  try {
    if (url.startsWith("/")) {
      return url;
    }

    const parsed = new URL(url);
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return DEFAULT_PATH;
  }
}

function clientPath(clientUrl) {
  try {
    const parsed = new URL(clientUrl);
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return "";
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "New booking inquiry",
    body: "A guest sent a request on your booking site",
    url: DEFAULT_PATH,
    icon: "/icon",
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    // keep defaults
  }

  const path = toAppPath(payload.url);

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: "/icon",
      data: { path },
      tag: "hostvia-booking-inquiry",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const path = toAppPath(event.notification.data?.path ?? event.notification.data?.url);
  const targetUrl = new URL(path, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if (!client.url.startsWith(self.location.origin)) continue;

        await client.focus();
        if (clientPath(client.url) !== path) {
          client.postMessage({ type: "HOSTVIA_NAVIGATE", path });
        }
        return;
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
