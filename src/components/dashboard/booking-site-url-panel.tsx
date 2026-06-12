"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Globe, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BOOKING_DOMAIN,
  getBookingSiteLabel,
  getBookingSiteUrl,
  usesBookingSubdomain,
} from "@/lib/public/booking-site-url";
import { isValidUsername } from "@/lib/public/slug";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookingSiteUrlPanelProps {
  username: string;
  onUsernameChange: (value: string) => void;
  isPublished: boolean;
}

export function BookingSiteUrlPanel({
  username,
  onUsernameChange,
  isPublished,
}: BookingSiteUrlPanelProps) {
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  const siteUrl = useMemo(
    () => getBookingSiteUrl(username, { baseUrl: origin }),
    [username, origin]
  );

  const siteLabel = useMemo(
    () => getBookingSiteLabel(username, { baseUrl: origin }),
    [username, origin]
  );

  const subdomainMode = usesBookingSubdomain(origin);
  const cleanUsername = username.trim().toLowerCase();
  const usernameValid = !cleanUsername || isValidUsername(cleanUsername);

  async function handleCopy() {
    if (!siteUrl) return;

    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <section className="hostvia-panel overflow-hidden">
      <div className="hostvia-panel-header">
        <div className="hostvia-panel-icon">
          <Link2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Your booking site link</p>
          <p className="text-xs text-zinc-500">
            {subdomainMode
              ? `Guests open your page at your own ${BOOKING_DOMAIN} address`
              : "Subdomain links work on your live domain after deploy"}
          </p>
        </div>
        {isPublished ? (
          <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
            Live
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-zinc-600/40 bg-zinc-800/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
            Draft
          </span>
        )}
      </div>

      <div className="hostvia-panel-body space-y-4">
        <div className="space-y-2">
          <Label htmlFor="booking-site-username" className="text-zinc-300">
            Site address
          </Label>

          {subdomainMode ? (
            <div
              className={cn(
                "flex overflow-hidden rounded-xl border bg-black/20",
                usernameValid
                  ? "border-white/10 focus-within:border-violet-500/40"
                  : "border-red-500/40"
              )}
            >
              <div className="flex items-center border-r border-white/10 bg-white/[0.03] px-3 text-zinc-500">
                <Globe className="h-4 w-4 shrink-0" />
              </div>
              <Input
                id="booking-site-username"
                value={username}
                onChange={(e) =>
                  onUsernameChange(e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                placeholder="fairy-tale"
                className="h-11 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
              />
              <div className="flex items-center border-l border-white/10 bg-white/[0.02] px-3 text-sm text-zinc-400">
                .{BOOKING_DOMAIN}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className={cn(
                  "flex overflow-hidden rounded-xl border bg-black/20",
                  usernameValid
                    ? "border-white/10 focus-within:border-violet-500/40"
                    : "border-red-500/40"
                )}
              >
                <div className="flex min-w-0 flex-1 items-center border-r border-white/10 bg-white/[0.03] px-3 text-xs text-zinc-500 sm:text-sm">
                  <span className="truncate">
                    {origin?.replace(/^https?:\/\//, "") ?? "localhost"}/host/
                  </span>
                </div>
                <Input
                  id="booking-site-username"
                  value={username}
                  onChange={(e) =>
                    onUsernameChange(
                      e.target.value.toLowerCase().replace(/\s/g, "")
                    )
                  }
                  placeholder="fairy-tale"
                  className="h-11 min-w-[8rem] flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>
          )}

          {!usernameValid ? (
            <p className="text-xs text-red-400">
              Use 2–50 characters: lowercase letters, numbers and hyphens only.
            </p>
          ) : (
            <p className="text-xs text-zinc-500">
              Example:{" "}
              <span className="font-medium text-zinc-300">
                fairy-tale.{BOOKING_DOMAIN}
              </span>
            </p>
          )}
        </div>

        {siteLabel && usernameValid ? (
          <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Public link
              </p>
              <p className="mt-1 truncate font-mono text-sm text-violet-200">
                {siteLabel}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hostvia-dashboard-btn border-white/10 bg-white/[0.03]"
                onClick={handleCopy}
                disabled={!siteUrl}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy
              </Button>
              {isPublished && siteUrl ? (
                <Button
                  size="sm"
                  className="hostvia-btn-gradient"
                  asChild
                >
                  <Link href={siteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open site
                  </Link>
                </Button>
              ) : (
                <Button size="sm" className="hostvia-btn-gradient" disabled>
                  <ExternalLink className="h-4 w-4" />
                  Open site
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {!isPublished ? (
          <p className="text-xs leading-relaxed text-zinc-500">
            Turn on <span className="text-zinc-300">Publish booking site</span>{" "}
            below and save — then this link goes live for guests.
          </p>
        ) : null}
      </div>
    </section>
  );
}
