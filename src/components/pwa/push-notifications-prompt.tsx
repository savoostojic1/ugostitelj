"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { isStandaloneDisplayMode } from "@/lib/pwa/standalone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PushNotificationsPromptProps {
  className?: string;
  /** Hide on dashboard once notifications are enabled */
  hideWhenSubscribed?: boolean;
}

export function PushNotificationsPrompt({
  className,
  hideWhenSubscribed = false,
}: PushNotificationsPromptProps) {
  const {
    state,
    loading,
    subscribe,
    unsubscribe,
    refresh,
    isSubscribed,
    canSubscribe,
  } = usePushNotifications();
  const [busy, setBusy] = useState(false);
  const installed = isStandaloneDisplayMode();

  if (!installed) {
    return null;
  }

  if (hideWhenSubscribed && !loading && isSubscribed) {
    return null;
  }

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
                : "Get a push alert on this device for new booking inquiries"}
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
            This device does not support push notifications (iPhone 16.4+ required).
          </p>
        ) : null}

        {state === "no-service-worker" ? (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-200/90">
            App worker did not start. Fully close Hostvia, open again from your
            home screen, then tap Enable.
          </p>
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
          {!loading ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-zinc-400"
              disabled={busy}
              onClick={() => void refresh()}
            >
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
