"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallAppDialog } from "@/components/pwa/install-app-dialog";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { isStandaloneDisplayMode } from "@/lib/pwa/standalone";

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showInstallEntry, canOneClickInstall, isIos, promptInstall } =
    usePwaInstall();

  useEffect(() => {
    if (isStandaloneDisplayMode() || !showInstallEntry) return;

    const dismissed = localStorage.getItem("hostvia-pwa-dismissed");
    if (dismissed === "1") return;

    setVisible(true);
  }, [showInstallEntry]);

  function dismiss() {
    localStorage.setItem("hostvia-pwa-dismissed", "1");
    setVisible(false);
  }

  async function handleInstall() {
    if (canOneClickInstall) {
      const result = await promptInstall();
      if (result === "accepted" || result === "dismissed") {
        dismiss();
      }
      return;
    }

    setDialogOpen(true);
  }

  if (isStandaloneDisplayMode()) return null;

  if (!visible && !dialogOpen) return null;

  return (
    <>
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-border bg-card p-4 shadow-lg sm:left-auto sm:right-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Install app</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {canOneClickInstall
                ? "Open Hostvia from your home screen with one tap."
                : isIos
                  ? "Add Hostvia to your home screen — we'll show you how."
                  : "Add Hostvia to your home screen for quick access."}
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                {canOneClickInstall ? "Install" : "How to install"}
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={dismiss}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <InstallAppDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
