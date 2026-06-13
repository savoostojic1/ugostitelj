"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Globe, Sparkles } from "lucide-react";
import { useIsStandalonePwa } from "@/hooks/use-is-standalone-pwa";
import { useHostProfile } from "@/hooks/use-host-profile";
import {
  bookingUrlOptionsFromConfig,
  useBookingSiteConfig,
} from "@/hooks/use-booking-site-config";
import {
  suggestPropertySlug,
  useUpdatePropertyPublic,
} from "@/hooks/use-property-public";
import { getBookingSiteUrl } from "@/lib/public/booking-site-url";
import { openInSystemBrowser } from "@/lib/pwa/standalone";
import type { Property } from "@/types/database";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PropertyPublishPanel({ property }: { property: Property }) {
  const panelRef = useRef<HTMLElement>(null);
  const { data: hostProfile } = useHostProfile();
  const { data: bookingConfig } = useBookingSiteConfig();
  const isPwa = useIsStandalonePwa();
  const updatePublic = useUpdatePropertyPublic();

  const [isPublic, setIsPublic] = useState(property.is_public ?? false);

  useEffect(() => {
    setIsPublic(property.is_public ?? false);
  }, [property.is_public]);

  useEffect(() => {
    if (window.location.hash !== "#publish-listing") return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const urlOptions = bookingUrlOptionsFromConfig(bookingConfig, origin);
  const hostSiteReady = Boolean(
    hostProfile?.username && hostProfile.is_published
  );
  const hostPublicUrl = hostSiteReady
    ? getBookingSiteUrl(hostProfile!.username, urlOptions)
    : null;

  const hasChanges = isPublic !== (property.is_public ?? false);
  const isPublished = property.is_public ?? false;

  function handlePublish() {
    updatePublic.mutate(
      {
        id: property.id,
        slug: property.slug ?? suggestPropertySlug(property.name),
        short_description: property.short_description ?? null,
        capacity: property.capacity ?? null,
        amenities: property.amenities ?? [],
        gallery_urls: property.gallery_urls ?? [],
        is_public: isPublic,
      },
      {
        onSuccess: () => {
          toast.success(
            isPublic
              ? "Listing published on your booking site"
              : "Listing hidden from booking site"
          );
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Could not save"),
      }
    );
  }

  return (
    <section
      id="publish-listing"
      ref={panelRef}
      className={cn(
        "hostvia-panel scroll-mt-24 overflow-hidden",
        isPublished
          ? "border-emerald-500/25"
          : "border-violet-500/25"
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                isPublished
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-violet-500/15 text-violet-300"
              )}
            >
              {isPublished ? (
                <Check className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Step 3 of 3 · Booking site
              </p>
              <h2 className="mt-1 text-base font-semibold text-white">
                Publish this accommodation
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-500">
                When published, guests can see{" "}
                <span className="text-zinc-300">{property.name}</span> on your
                direct booking website and send inquiries or book (if you allow
                it). Unpublished units stay private in your dashboard only.
              </p>
            </div>
          </div>

          {isPublished && hostPublicUrl ? (
            isPwa ? (
              <button
                type="button"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-zinc-300 hover:bg-white/5"
                onClick={() => openInSystemBrowser(hostPublicUrl)}
              >
                <ExternalLink className="h-4 w-4" />
                View booking site
              </button>
            ) : (
              <Link
                href={hostPublicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-zinc-300 hover:bg-white/5"
              >
                <ExternalLink className="h-4 w-4" />
                View booking site
              </Link>
            )
          ) : null}
        </div>

        {!hostSiteReady ? (
          <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 text-sm text-amber-100/90">
            <p className="font-medium text-amber-50">
              Your booking site is not live yet
            </p>
            <p className="mt-1 text-amber-100/80">
              Set up and publish your main booking site first, then publish this
              unit.
            </p>
            <Link
              href="/dashboard/public-site"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-200 hover:text-amber-100"
            >
              <Globe className="h-4 w-4" />
              Open booking site settings
            </Link>
          </div>
        ) : null}

        <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-violet-500"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-white">
                Show on my booking site
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
                Turn this on to list {property.name} publicly. Add photos and a
                description in the section below before publishing.
              </span>
            </span>
          </label>

          <button
            type="button"
            onClick={handlePublish}
            disabled={updatePublic.isPending || !hasChanges}
            className={cn(
              "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
              isPublic
                ? "hostvia-btn-gradient"
                : "border border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.06]"
            )}
          >
            {updatePublic.isPending
              ? "Saving…"
              : isPublic
                ? "Publish listing"
                : "Hide from booking site"}
          </button>

          {isPublished && !hasChanges ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400/90">
              <Check className="h-3.5 w-3.5" />
              This listing is live on your booking site
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
