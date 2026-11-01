"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { trackHostviaEvent } from "@/lib/analytics/track";
import { getThemeDefinition } from "@/lib/guest-guide/themes";
import {
  GUEST_GUIDE_CREATE_PATH,
  GUEST_GUIDE_PUBLIC_PREFIX,
} from "@/lib/guest-guide/content";
import { clearLocalDraft, readLocalDraft } from "@/lib/guest-guide/local-draft";
import { publishGuestGuideDraft } from "@/lib/guest-guide/publish-draft";
import type { GuestGuideStatus, GuestGuideTheme } from "@/lib/guest-guide/types";
import { absoluteUrl } from "@/lib/seo/site";

interface GuideListItem {
  id: string;
  slug: string;
  title: string;
  theme: GuestGuideTheme;
  status: GuestGuideStatus;
  cover_image_url: string | null;
  updated_at: string;
  published_at: string | null;
}

async function claimIfNeeded() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("claim") !== "1") return;

  const hasLocalDraft = Boolean(readLocalDraft()?.document);
  try {
    const guide = await publishGuestGuideDraft();
    clearLocalDraft();
    trackHostviaEvent("guest_guide_publish", { slug: guide.slug });
    trackHostviaEvent("guest_guide_registration_complete", {
      method: "oauth_or_redirect",
    });
    toast.success("Guest guide published");
    window.history.replaceState({}, "", "/dashboard/guest-guides");
    window.location.href = `/dashboard/guest-guides/${guide.id}`;
  } catch (err) {
    if (hasLocalDraft) {
      toast.error(
        err instanceof Error ? err.message : "Could not publish your draft"
      );
    }
    window.history.replaceState({}, "", "/dashboard/guest-guides");
  }
}

export function GuestGuidesDashboard() {
  const [guides, setGuides] = useState<GuideListItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/guest-guides");
      const json = (await res.json()) as {
        guides?: GuideListItem[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setGuides(json.guides ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
      setGuides([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await claimIfNeeded();
      await load();
    })();
  }, []);

  async function setPublished(id: string, publish: boolean) {
    const res = await fetch(`/api/guest-guides/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish }),
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      toast.error(json.error ?? "Update failed");
      return;
    }
    toast.success(publish ? "Published" : "Unpublished");
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this guest guide permanently?")) return;
    const res = await fetch(`/api/guest-guides/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      toast.error(json.error ?? "Delete failed");
      return;
    }
    toast.success("Deleted");
    await load();
  }

  function copyLink(slug: string) {
    const url = absoluteUrl(`${GUEST_GUIDE_PUBLIC_PREFIX}/${slug}`);
    void navigator.clipboard.writeText(url);
    trackHostviaEvent("guest_guide_share", { method: "copy_link" });
    toast.success("Link copied");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Guest Guides
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Create beautiful digital welcome books for your guests — completely free.
          </p>
        </div>
        <Link
          href={GUEST_GUIDE_CREATE_PATH}
          className="hostvia-btn-gradient inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          New guide
        </Link>
      </div>

      {loading || guides === null ? (
        <div className="flex items-center gap-2 py-16 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading guides…
        </div>
      ) : guides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
          <p className="text-lg font-medium text-white">No guest guides yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Create a premium digital welcome book with check-in details, Wi-Fi,
            house rules and local tips.
          </p>
          <Link
            href={GUEST_GUIDE_CREATE_PATH}
            className="mt-6 inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/5"
          >
            Create your first guide
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => {
            const theme = getThemeDefinition(guide.theme);
            return (
              <li
                key={guide.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="aspect-[16/10] bg-zinc-900">
                  {guide.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={guide.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full items-end p-4"
                      style={{
                        background: `linear-gradient(135deg, ${theme.swatch[0]}, ${theme.swatch[1]})`,
                      }}
                    >
                      <span className="text-sm font-medium text-white/90">
                        {guide.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="truncate text-base font-semibold text-white">
                      {guide.title}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      {theme.name} ·{" "}
                      <span className="capitalize">{guide.status}</span> · Updated{" "}
                      {new Date(guide.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/guest-guide/${guide.id}/edit`}
                      className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5"
                    >
                      Edit
                    </Link>
                    {guide.status === "published" ? (
                      <>
                        <a
                          href={`${GUEST_GUIDE_PUBLIC_PREFIX}/${guide.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5"
                        >
                          Preview <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => copyLink(guide.slug)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5"
                        >
                          <Copy className="h-3 w-3" /> Link
                        </button>
                        <a
                          href={`/guide/${guide.slug}/qr`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackHostviaEvent("guest_guide_qr_download", {
                              location: "dashboard",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5"
                        >
                          <QrCode className="h-3 w-3" /> QR
                        </a>
                        <button
                          type="button"
                          onClick={() => void setPublished(guide.id, false)}
                          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5"
                        >
                          Unpublish
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void setPublished(guide.id, true)}
                        className="rounded-lg border border-emerald-400/30 px-2.5 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-400/10"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void remove(guide.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-400/20 px-2.5 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-400/10"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
