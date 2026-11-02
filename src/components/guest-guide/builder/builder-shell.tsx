"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Cloud,
  Eye,
  Loader2,
  Menu,
  Pencil,
  Save,
} from "lucide-react";
import { GuideView } from "@/components/guest-guide/guide-renderer/guide-view";
import { SectionEditor } from "@/components/guest-guide/builder/section-editors";
import { PublishGate } from "@/components/guest-guide/builder/publish-gate";
import {
  createEmptyGuideDocument,
  SECTION_HINTS,
  SECTION_LABELS,
} from "@/lib/guest-guide/defaults";
import { GUEST_GUIDE_PATH } from "@/lib/guest-guide/content";
import {
  clearLocalDraft,
  readLocalDraft,
  writeLocalDraft,
} from "@/lib/guest-guide/local-draft";
import { THEME_DEFINITIONS } from "@/lib/guest-guide/themes";
import type {
  GuestGuideDocument,
  GuestGuideSectionId,
  GuestGuideTheme,
} from "@/lib/guest-guide/types";
import { trackHostviaEvent, trackOncePerSession } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SaveState = "idle" | "saving" | "saved" | "error";
type MobilePane = "edit" | "preview";

async function persistServerDraft(document: GuestGuideDocument) {
  const res = await fetch("/api/guest-guides/drafts", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      theme: document.theme,
      content: document.content,
      sectionOrder: document.sectionOrder,
      sectionVisibility: document.sectionVisibility,
    }),
  });
  const json = (await res.json()) as {
    id?: string | null;
    persisted?: boolean;
    error?: string;
  };
  if (!res.ok) throw new Error(json.error ?? "Could not save draft");
  return json;
}

export function GuestGuideBuilderShell({
  initialGuideId,
  initialDocument,
}: {
  initialGuideId?: string;
  initialDocument?: GuestGuideDocument;
} = {}) {
  const [document, setDocument] = useState<GuestGuideDocument>(
    () => initialDocument ?? createEmptyGuideDocument()
  );
  const [sectionId, setSectionId] =
    useState<GuestGuideSectionId>("welcome");
  const [mobilePane, setMobilePane] = useState<MobilePane>("edit");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [publishOpen, setPublishOpen] = useState(false);
  const [hydrated, setHydrated] = useState(Boolean(initialDocument));
  const [serverDraftId, setServerDraftId] = useState<string | undefined>();
  const isOwnedEditor = Boolean(initialGuideId);

  useEffect(() => {
    trackOncePerSession("guest_guide_builder_start", {
      mode: isOwnedEditor ? "authenticated" : "anonymous",
    });
  }, [isOwnedEditor]);

  useEffect(() => {
    if (initialDocument) {
      setHydrated(true);
      return;
    }
    const local = readLocalDraft();
    if (local) {
      setDocument(local.document);
      setServerDraftId(local.serverDraftId);
    }
    setHydrated(true);

    void (async () => {
      try {
        const res = await fetch("/api/guest-guides/drafts");
        if (!res.ok) return;
        const json = (await res.json()) as {
          document?: GuestGuideDocument | null;
          id?: string;
          updatedAt?: string;
        };
        if (!json.document) return;
        const localUpdated = local?.updatedAt
          ? Date.parse(local.updatedAt)
          : 0;
        const serverUpdated = json.updatedAt ? Date.parse(json.updatedAt) : 0;
        if (!local || serverUpdated > localUpdated) {
          setDocument(json.document);
          if (json.id) setServerDraftId(json.id);
          writeLocalDraft(json.document, json.id);
        }
      } catch {
        // Local draft remains authoritative offline.
      }
    })();
  }, [initialDocument]);

  const scheduleSave = useCallback(
    (next: GuestGuideDocument, draftId?: string) => {
      if (isOwnedEditor && initialGuideId) {
        writeLocalDraft(next, draftId);
        setSaveState("saving");
        const timer = window.setTimeout(() => {
          void (async () => {
            try {
              const res = await fetch(`/api/guest-guides/${initialGuideId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  theme: next.theme,
                  content: next.content,
                  sectionOrder: next.sectionOrder,
                  sectionVisibility: next.sectionVisibility,
                  title: next.content.welcome.propertyName || "Guest guide",
                  coverImageUrl: next.content.welcome.coverPhotoUrl || null,
                }),
              });
              if (!res.ok) {
                const json = (await res.json()) as { error?: string };
                throw new Error(json.error ?? "Save failed");
              }
              setSaveState("saved");
            } catch {
              setSaveState("error");
            }
          })();
        }, 500);
        return () => window.clearTimeout(timer);
      }

      writeLocalDraft(next, draftId ?? serverDraftId);
      setSaveState("saving");
      const timer = window.setTimeout(() => {
        void (async () => {
          try {
            const result = await persistServerDraft(next);
            if (result.id) {
              setServerDraftId(result.id);
              writeLocalDraft(next, result.id);
            } else {
              writeLocalDraft(next);
            }
            // Local draft is always kept; server sync may be unavailable without service role.
            setSaveState("saved");
          } catch {
            writeLocalDraft(next);
            setSaveState("saved");
          }
        })();
      }, 650);
      return () => window.clearTimeout(timer);
    },
    [initialGuideId, isOwnedEditor, serverDraftId]
  );

  useEffect(() => {
    if (!hydrated) return;
    return scheduleSave(document);
  }, [document, hydrated, scheduleSave]);

  const sections = useMemo(() => document.sectionOrder, [document.sectionOrder]);

  function updateDocument(patch: Partial<GuestGuideDocument>) {
    setDocument((prev) => ({ ...prev, ...patch }));
  }

  function setTheme(theme: GuestGuideTheme) {
    updateDocument({ theme });
    trackHostviaEvent("guest_guide_template_select", {
      theme,
      location: "builder",
    });
  }

  function moveSection(id: GuestGuideSectionId, direction: -1 | 1) {
    const index = document.sectionOrder.indexOf(id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= document.sectionOrder.length) {
      return;
    }
    const order = [...document.sectionOrder];
    const [item] = order.splice(index, 1);
    order.splice(nextIndex, 0, item);
    updateDocument({ sectionOrder: order });
  }

  async function onPublishClick() {
    trackHostviaEvent("guest_guide_preview_view", { location: "builder_publish" });
    if (isOwnedEditor && initialGuideId) {
      try {
        const res = await fetch(`/api/guest-guides/${initialGuideId}/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publish: true }),
        });
        const json = (await res.json()) as {
          error?: string;
          slug?: string;
          guide?: { slug?: string };
        };
        if (!res.ok) throw new Error(json.error ?? "Publish failed");
        trackHostviaEvent("guest_guide_publish", {
          slug: json.guide?.slug ?? json.slug ?? "",
        });
        toast.success("Guide published");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Publish failed");
      }
      return;
    }
    trackHostviaEvent("guest_guide_registration_start", { location: "builder" });
    setPublishOpen(true);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070b] text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="gg-builder dark min-h-screen bg-[#07070b] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07070b]/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-3 md:px-4">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sections"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link
            href={GUEST_GUIDE_PATH}
            className="hidden items-center gap-1.5 text-sm text-zinc-400 hover:text-white sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Guest Guide
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {document.content.welcome.propertyName || "Untitled guest guide"}
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              {saveState === "saving" ? (
                <>
                  <Cloud className="h-3 w-3 animate-pulse" /> Saving draft…
                </>
              ) : saveState === "error" ? (
                "Could not sync — draft kept locally"
              ) : (
                <>
                  <Check className="h-3 w-3 text-emerald-400" /> Draft saved
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-white/10 p-0.5 md:hidden">
              <button
                type="button"
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-semibold",
                  mobilePane === "edit" ? "bg-white/10 text-white" : "text-zinc-500"
                )}
                onClick={() => setMobilePane("edit")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-semibold",
                  mobilePane === "preview"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500"
                )}
                onClick={() => {
                  setMobilePane("preview");
                  trackHostviaEvent("guest_guide_preview_view", {
                    location: "builder_mobile",
                  });
                }}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void onPublishClick()}
              className="hostvia-btn-gradient inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold sm:h-10 sm:px-4 sm:text-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isOwnedEditor ? "Publish" : "Save & Publish"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] md:grid-cols-[240px_minmax(0,1fr)_minmax(320px,0.95fr)] lg:grid-cols-[260px_minmax(0,1fr)_minmax(380px,0.9fr)]">
        <aside
          className={cn(
            "border-white/10 bg-[#0b0b11] md:sticky md:top-14 md:block md:h-[calc(100vh-3.5rem)] md:overflow-y-auto md:border-r",
            sidebarOpen
              ? "fixed inset-0 z-50 block p-4"
              : "hidden"
          )}
        >
          {sidebarOpen ? (
            <button
              type="button"
              className="mb-4 text-sm text-zinc-400 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
          ) : null}
          <p className="px-3 pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Sections
          </p>
          <nav className="mt-2 space-y-1 px-2 pb-4">
            {sections.map((id, index) => {
              const visible = document.sectionVisibility[id] !== false;
              return (
                <div key={id} className="rounded-xl hover:bg-white/[0.03]">
                  <button
                    type="button"
                    onClick={() => {
                      setSectionId(id);
                      setSidebarOpen(false);
                      setMobilePane("edit");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm",
                      sectionId === id
                        ? "bg-white/[0.07] text-white"
                        : "text-zinc-400"
                    )}
                  >
                    <span className={cn(!visible && "opacity-50")}>
                      {SECTION_LABELS[id]}
                    </span>
                    <span className="text-[10px] text-zinc-600">{index + 1}</span>
                  </button>
                  <div className="flex items-center gap-1 px-2 pb-2">
                    <button
                      type="button"
                      className="rounded px-1.5 text-[10px] text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      onClick={() => moveSection(id, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="rounded px-1.5 text-[10px] text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      onClick={() => moveSection(id, 1)}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="ml-auto rounded px-1.5 text-[10px] text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      onClick={() =>
                        updateDocument({
                          sectionVisibility: {
                            ...document.sectionVisibility,
                            [id]: !visible,
                          },
                        })
                      }
                    >
                      {visible ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-3 py-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Design
            </p>
            <div className="mt-3 space-y-2">
              {THEME_DEFINITIONS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setTheme(theme.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left",
                    document.theme === theme.id
                      ? "border-amber-200/30 bg-amber-100/[0.06]"
                      : "border-white/10 bg-transparent hover:border-white/20"
                  )}
                >
                  <span className="flex gap-1" aria-hidden>
                    {theme.swatch.map((color) => (
                      <span
                        key={color}
                        className="h-3 w-3 rounded-full border border-white/20"
                        style={{ background: color }}
                      />
                    ))}
                  </span>
                  <span className="text-xs font-medium text-zinc-200">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section
          className={cn(
            "min-w-0 border-white/10 md:border-r",
            mobilePane === "preview" ? "hidden md:block" : "block"
          )}
        >
          <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-violet-300">
              {SECTION_LABELS[sectionId]}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {SECTION_LABELS[sectionId]}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {SECTION_HINTS[sectionId]}
            </p>
            <div className="mt-6">
              <SectionEditor
                sectionId={sectionId}
                content={document.content}
                onChange={(content) => updateDocument({ content })}
              />
            </div>
            {!isOwnedEditor ? (
              <p className="mt-8 text-xs text-zinc-600">
                Your draft autosaves in this browser and on our servers.{" "}
                <button
                  type="button"
                  className="text-zinc-400 underline-offset-2 hover:underline"
                  onClick={() => {
                    clearLocalDraft();
                    setDocument(createEmptyGuideDocument(document.theme));
                    toast.message("Started a fresh draft");
                  }}
                >
                  Start over
                </button>
              </p>
            ) : null}
          </div>
        </section>

        <section
          className={cn(
            "min-w-0 bg-[#050508]",
            mobilePane === "edit" ? "hidden md:block" : "block"
          )}
        >
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Live preview
              </p>
            </div>
            <GuideView document={document} compact showBrand />
          </div>
        </section>
      </div>

      <PublishGate open={publishOpen} onClose={() => setPublishOpen(false)} />
    </div>
  );
}
