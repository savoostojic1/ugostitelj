"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type HostviaNavigateMessage = {
  type?: string;
  path?: string;
};

export function PushNavigationHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    function onMessage(event: MessageEvent<HostviaNavigateMessage>) {
      if (event.data?.type !== "HOSTVIA_NAVIGATE") return;
      const path = event.data.path;
      if (!path || !path.startsWith("/")) return;
      router.push(path);
    }

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, [router]);

  return null;
}
