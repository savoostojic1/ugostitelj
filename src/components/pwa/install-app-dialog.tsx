"use client";

import { Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePwaInstall } from "@/hooks/use-pwa-install";

interface InstallAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallAppDialog({ open, onOpenChange }: InstallAppDialogProps) {
  const { canOneClickInstall, isIos, promptInstall } = usePwaInstall();

  async function handleInstall() {
    const result = await promptInstall();
    if (result === "accepted" || result === "dismissed") {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,100%)] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Install Hostvia app
          </DialogTitle>
        </DialogHeader>

        {isIos ? (
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              On iPhone, Apple requires a quick manual step — we cannot install
              automatically with one button.
            </p>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  1
                </span>
                <span>
                  Tap <Share className="inline h-4 w-4 align-text-bottom" />{" "}
                  <strong>Share</strong> at the bottom of Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  2
                </span>
                <span>
                  Choose <strong>Add to Home Screen</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> — the app icon appears on your home
                  screen
                </span>
              </li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Use Safari — Chrome on iPhone does not support install to home
              screen.
            </p>
          </div>
        ) : canOneClickInstall ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Install Hostvia on your home screen for quick access, push
              notifications, and a full-screen experience.
            </p>
            <Button className="w-full" onClick={handleInstall}>
              <Download className="h-4 w-4" />
              Install now
            </Button>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Open this site in <strong>Chrome</strong>, then use the browser
              menu <strong>⋮</strong> → <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </p>
            <p className="text-xs">
              If you already dismissed install, reload the page and the install
              option may appear here again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
