"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { InstallAppDialog } from "@/components/pwa/install-app-dialog";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function InstallAppSidebarButton({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showInstallEntry, canOneClickInstall, promptInstall } = usePwaInstall();

  if (!showInstallEntry) return null;

  async function handleClick() {
    onNavigate?.();
    if (canOneClickInstall) {
      await promptInstall();
      return;
    }
    setDialogOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="hostvia-sidebar-link w-full"
      >
        <Download className="h-4 w-4 shrink-0" />
        Install app
      </button>
      <InstallAppDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
