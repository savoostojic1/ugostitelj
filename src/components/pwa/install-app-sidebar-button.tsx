"use client";

import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function InstallAppSidebarButton({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { showInstallEntry, canOneClickInstall, isIos, promptInstall } =
    usePwaInstall();

  if (!showInstallEntry) return null;

  async function handleClick() {
    onNavigate?.();

    if (canOneClickInstall) {
      await promptInstall();
      return;
    }

    if (isIos) {
      router.push("/dashboard/install-app");
      return;
    }

    router.push("/dashboard/install-app");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="hostvia-sidebar-link w-full"
    >
      <Download className="h-4 w-4 shrink-0" />
      Install app
    </button>
  );
}
