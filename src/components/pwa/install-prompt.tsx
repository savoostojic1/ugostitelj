"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = localStorage.getItem("ugostitelj-pwa-dismissed");
    if (dismissed === "1") return;

    if (isIos()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem("ugostitelj-pwa-dismissed", "1");
    setVisible(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setVisible(false);
    localStorage.setItem("ugostitelj-pwa-dismissed", "1");
  }

  if (!visible || isStandalone()) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-border bg-card p-4 shadow-lg sm:left-auto sm:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Instaliraj aplikaciju</p>
          {iosHint ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Safari →{" "}
              <Share className="inline h-3.5 w-3.5 align-text-bottom" /> Podijeli
              → Dodaj na početni ekran
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Otvori Ugostitelj direktno sa početnog ekrana, bez browsera.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {!iosHint && installEvent && (
              <Button size="sm" onClick={install}>
                Instaliraj
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Ne sada
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={dismiss}
          aria-label="Zatvori"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
