"use client";

import { useEffect } from "react";
import { ensureServiceWorkerRegistration } from "@/lib/push/service-worker-registration";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void ensureServiceWorkerRegistration();
  }, []);

  return null;
}
