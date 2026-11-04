"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PushNotificationsPrompt } from "@/components/pwa/push-notifications-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/notifications/preferences";
import { toast } from "sonner";

const EMAIL_OPTIONS: Array<{
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}> = [
  {
    key: "emailNewRequest",
    label: "New booking requests",
    description: "Email you when a guest sends a request from your booking site.",
  },
  {
    key: "emailConfirmation",
    label: "Booking confirmations",
    description: "Email you after you confirm a request.",
  },
  {
    key: "emailCancellation",
    label: "Booking cancellations",
    description: "Email you when a guest or you cancels a reservation.",
  },
];

const PUSH_OPTIONS: Array<{
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}> = [
  {
    key: "pushNewRequest",
    label: "New booking requests",
    description: "Push alert for a new request.",
  },
  {
    key: "pushConfirmation",
    label: "Booking confirmations",
    description: "Push alert after you confirm a request.",
  },
  {
    key: "pushCancellation",
    label: "Booking cancellations",
    description: "Push alert when a reservation is cancelled.",
  },
];

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/notification-preferences");
        const body = (await response.json().catch(() => null)) as {
          preferences?: NotificationPreferences;
        } | null;
        if (!cancelled && response.ok && body?.preferences) {
          setPreferences(body.preferences);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(key: keyof NotificationPreferences) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        toast.error(body?.error || "Could not save notification settings.");
        return;
      }
      toast.success("Notification settings saved");
    } catch {
      toast.error("Could not save notification settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Account"
        title="Notifications"
        description="Email works on its own. Push alerts also need permission on this browser or phone, and on iPhone they need Hostvia installed to the home screen."
      />

      <Card>
        <CardContent className="space-y-5 p-5">
          <div>
            <h2 className="text-base font-semibold">Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sent from Hostvia. These do not depend on installing the app.
              Email is on by default.
            </p>
          </div>
          {EMAIL_OPTIONS.map((option) => (
            <label key={option.key} className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={preferences[option.key]}
                disabled={loading || saving}
                onChange={() => toggle(option.key)}
              />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-sm text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-5">
          <div>
            <h2 className="text-base font-semibold">Push</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Delivered only where notifications are allowed.{" "}
              <Link href="/dashboard/install-app" className="underline">
                Install Hostvia
              </Link>{" "}
              if this device asks for the app first.
            </p>
          </div>
          {PUSH_OPTIONS.map((option) => (
            <label key={option.key} className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={preferences[option.key]}
                disabled={loading || saving}
                onChange={() => toggle(option.key)}
              />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-sm text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Button type="button" onClick={() => void save()} disabled={loading || saving}>
        {saving ? "Saving…" : "Save notification settings"}
      </Button>

      <PushNotificationsPrompt />
    </div>
  );
}
