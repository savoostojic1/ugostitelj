"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { isStandaloneDisplayMode } from "@/lib/pwa/standalone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PushNotificationsPrompt({ className }: { className?: string }) {
  const { state, loading, subscribe, unsubscribe, isSubscribed, canSubscribe } =
    usePushNotifications();
  const [busy, setBusy] = useState(false);
  const installed = isStandaloneDisplayMode();

  async function handleEnable() {
    setBusy(true);
    try {
      await subscribe();
      toast.success("Notifications enabled on this device");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not enable");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      await unsubscribe();
      toast.success("Notifications turned off on this device");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not disable");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={cn(
        "hostvia-panel overflow-hidden",
        isSubscribed && "border-emerald-500/20",
        className
      )}
    >
      <div className="hostvia-panel-header">
        <div className="hostvia-panel-icon">
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Phone notifications</p>
          <p className="text-xs text-zinc-500">
            {loading
              ? "Checking notification support…"
              : isSubscribed
                ? "You will get an alert when a guest sends a booking inquiry"
                : installed
                  ? "Get a push alert on this device for new booking inquiries"
                  : "Install the app on your home screen, then enable alerts here"}
          </p>
        </div>
        {isSubscribed ? (
          <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
            On
          </span>
        ) : null}
      </div>

      <div className="hostvia-panel-body space-y-3">
        {state === "no-vapid" ? (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-200/90">
            Server push keys are missing. In Vercel add{" "}
            <code className="text-[11px]">VAPID_PUBLIC_KEY</code>,{" "}
            <code className="text-[11px]">VAPID_PRIVATE_KEY</code> and{" "}
            <code className="text-[11px]">VAPID_SUBJECT</code>, then redeploy.
          </p>
        ) : null}

        {state === "unsupported" ? (
          <p className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-xs leading-relaxed text-zinc-400">
            This browser does not support push notifications. Use an installed
            Hostvia app on your phone (iPhone 16.4+ or Android).
          </p>
        ) : null}

        {!installed && state !== "unsupported" && state !== "no-vapid" ? (
          <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-400">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
            <p>
              Open Hostvia from your home screen (not Safari/Chrome tabs). On
              iPhone: Share → Add to Home Screen. Then return here and tap
              Enable.
            </p>
          </div>
        ) : null}

        {state === "denied" ? (
          <p className="text-xs leading-relaxed text-amber-200/90">
            Notifications are blocked in your phone settings. Allow notifications
            for Hostvia, then reload this page.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {loading ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="hostvia-dashboard-btn border-white/10 bg-white/[0.03]"
              disabled
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </Button>
          ) : isSubscribed ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="hostvia-dashboard-btn border-white/10 bg-white/[0.03]"
              disabled={busy}
              onClick={handleDisable}
            >
              <BellOff className="h-4 w-4" />
              Turn off
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="hostvia-btn-gradient"
              disabled={
                busy ||
                !canSubscribe ||
                !installed ||
                state === "denied" ||
                state === "no-vapid" ||
                state === "unsupported"
              }
              onClick={handleEnable}
            >
              <Bell className="h-4 w-4" />
              Enable notifications
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
