"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Share,
  Smartphone,
  SquarePlus,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export default function InstallAppPage() {
  const router = useRouter();
  const { canOneClickInstall, isIos, isInstalled, promptInstall } =
    usePwaInstall();
  const [installState, setInstallState] = useState<
    "idle" | "prompting" | "accepted" | "dismissed" | "unavailable"
  >("idle");

  useEffect(() => {
    if (isInstalled) {
      router.replace("/dashboard");
      return;
    }

    if (!isIos && canOneClickInstall && installState === "idle") {
      setInstallState("prompting");
      void promptInstall().then((result) => {
        if (result === "accepted") setInstallState("accepted");
        else if (result === "dismissed") setInstallState("dismissed");
        else setInstallState("unavailable");
      });
    }
  }, [
    canOneClickInstall,
    installState,
    isInstalled,
    isIos,
    promptInstall,
    router,
  ]);

  async function handleAndroidInstall() {
    setInstallState("prompting");
    const result = await promptInstall();
    if (result === "accepted") setInstallState("accepted");
    else if (result === "dismissed") setInstallState("dismissed");
    else setInstallState("unavailable");
  }

  if (isInstalled) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </Button>

      <DashboardPageHeader
        eyebrow="Mobile app"
        title="Install Hostvia"
        description={
          isIos
            ? "Add Hostvia to your iPhone home screen in a few taps"
            : "Install the app for quick access and notifications"
        }
      />

      {isIos ? (
        <section className="hostvia-panel overflow-hidden">
          <div className="hostvia-panel-header">
            <div className="hostvia-panel-icon">
              <Share className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                iPhone & iPad (Safari)
              </p>
              <p className="text-xs text-zinc-500">
                Apple does not allow one-tap install — follow these steps
              </p>
            </div>
          </div>
          <div className="hostvia-panel-body space-y-5">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
                  1
                </span>
                <div>
                  <p className="font-medium text-white">
                    Tap the Share button
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    At the <strong>bottom</strong> of Safari, tap{" "}
                    <Share className="inline h-4 w-4 align-text-bottom" />{" "}
                    <strong>Share</strong>
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
                  2
                </span>
                <div>
                  <p className="font-medium text-white">
                    Add to Home Screen
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Scroll the menu and tap{" "}
                    <SquarePlus className="inline h-4 w-4 align-text-bottom" />{" "}
                    <strong>Add to Home Screen</strong>
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
                  3
                </span>
                <div>
                  <p className="font-medium text-white">Confirm</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Tap <strong>Add</strong> in the top right — Hostvia appears
                    on your home screen like any other app
                  </p>
                </div>
              </li>
            </ol>

            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-100/90">
              You must use <strong>Safari</strong>. Chrome and other browsers on
              iPhone cannot add apps to the home screen.
            </p>
          </div>
        </section>
      ) : (
        <section className="hostvia-panel overflow-hidden">
          <div className="hostvia-panel-header">
            <div className="hostvia-panel-icon">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Android</p>
              <p className="text-xs text-zinc-500">
                One-tap install when using Chrome
              </p>
            </div>
          </div>
          <div className="hostvia-panel-body space-y-4">
            {installState === "prompting" && (
              <p className="text-sm text-zinc-400">
                Follow the install prompt on your screen…
              </p>
            )}
            {installState === "accepted" && (
              <p className="text-sm text-emerald-400">
                App installed — open Hostvia from your home screen.
              </p>
            )}
            {installState === "dismissed" && (
              <>
                <p className="text-sm text-zinc-400">
                  Install was cancelled. Tap below to try again.
                </p>
                <Button onClick={handleAndroidInstall} className="w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  Install again
                </Button>
              </>
            )}
            {(installState === "idle" || installState === "unavailable") && (
              <>
                {canOneClickInstall ? (
                  <Button onClick={handleAndroidInstall} className="w-full sm:w-auto">
                    <Download className="h-4 w-4" />
                    Install now
                  </Button>
                ) : (
                  <div className="space-y-3 text-sm text-zinc-400">
                    <p>
                      Open this page in <strong>Chrome</strong>, then use menu{" "}
                      <strong>⋮</strong> → <strong>Install app</strong> or{" "}
                      <strong>Add to Home screen</strong>.
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleAndroidInstall}
                      className="w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4" />
                      Try install prompt
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
