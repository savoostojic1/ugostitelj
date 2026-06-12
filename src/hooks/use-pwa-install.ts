"use client";

import { useCallback, useEffect, useState } from "react";
import { isStandaloneDisplayMode } from "@/lib/pwa/standalone";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function usePwaInstall() {
  const [canOneClickInstall, setCanOneClickInstall] = useState(
    () => deferredInstallPrompt !== null
  );
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneDisplayMode());
    setIsIos(isIosDevice());
    setCanOneClickInstall(deferredInstallPrompt !== null);

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      deferredInstallPrompt = event as BeforeInstallPromptEvent;
      setCanOneClickInstall(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const promptInstall = useCallback(async (): Promise<
    "accepted" | "dismissed" | "ios" | "unavailable"
  > => {
    if (isStandaloneDisplayMode()) return "unavailable";
    if (isIosDevice()) return "ios";
    if (!deferredInstallPrompt) return "unavailable";

    await deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    setCanOneClickInstall(false);
    return outcome;
  }, []);

  return {
    canOneClickInstall: !isInstalled && canOneClickInstall && !isIos,
    isIos: isIos && !isInstalled,
    isInstalled,
    showInstallEntry: !isInstalled,
    promptInstall,
  };
}
