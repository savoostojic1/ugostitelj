"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CloudOff,
  Eye,
  Loader2,
  Monitor,
  PenLine,
  Redo2,
  Rocket,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
  X,
} from "lucide-react";
import { Editor } from "@/components/website-builder/editor/editor";
import { LaunchStep } from "@/components/website-builder/launch";
import { QuickStartStep } from "@/components/website-builder/quick-start";
import { BuildChoice } from "@/components/website-builder/build-choice";
import { neighbourStep, STEP, STEP_LABELS, stepsForPath, type StepNumber } from "@/components/website-builder/steps";
import { PreviewFrame, type Device } from "@/components/website-builder/preview-frame";
import { Button, Kbd, Segmented } from "@/components/website-builder/ui";
import { useWebsiteStudio, type SaveState } from "@/components/website-builder/use-website-studio";
import {
  LookStep,
  PagesStep,
  PhotosStep,
  PropertyStep,
  StaysStep,
  StyleStep,
} from "@/components/website-builder/wizard-steps";
import { mergeWebsiteModel } from "@/lib/website-builder/merge-properties";
import { starterPhotos } from "@/lib/website-builder/photo-library";
import { themeMeta } from "@/lib/website-builder/themes";
import type { WebsiteDocument, WizardPath } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";
import "@/components/website-builder/builder.css";


function SaveIndicator({ state, error, onRetry }: { state: SaveState; error: string | null; onRetry: () => void }) {
  if (state === "error") {
    return (
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11.5px] font-medium text-rose-200" title={error ?? undefined}>
        <AlertTriangle className="h-3 w-3" /> Not saved · Retry
      </button>
    );
  }
  const map: Record<Exclude<SaveState, "error">, { icon: React.ReactNode; label: string; tone: string }> = {
    loading: { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: "Loading", tone: "text-zinc-500" },
    idle: { icon: <PenLine className="h-3 w-3" />, label: "Editing", tone: "text-zinc-500" },
    saving: { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: "Saving", tone: "text-zinc-400" },
    saved: { icon: <Check className="h-3 w-3" />, label: "Saved", tone: "text-emerald-300/90" },
    local: { icon: <CloudOff className="h-3 w-3" />, label: "Saved in this browser", tone: "text-amber-200/80" },
  };
  const item = map[state];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11.5px] font-medium", item.tone)} role="status" aria-live="polite">
      {item.icon}
      {item.label}
    </span>
  );
}

function Progress({ step, path, onStep }: { step: number; path: WizardPath; onStep: (step: number) => void }) {
  const steps = stepsForPath(path);
  const position = steps.indexOf(step as StepNumber);
  // A step off the path (opened from the launch checklist) sits between its neighbours.
  const reached = position >= 0 ? position : steps.filter((item) => item < step).length - 0.5;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11.5px] text-zinc-500">
        <span>{position >= 0 ? `Step ${position + 1} of ${steps.length}` : "Extra step"}</span>
        <span className="text-zinc-400">{STEP_LABELS[step as StepNumber]}</span>
      </div>
      <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-label="Progress">
        {steps.map((n, index) => (
          <li key={n}>
            <button type="button" onClick={() => onStep(n)} aria-current={n === step ? "step" : undefined} aria-label={`${index + 1}. ${STEP_LABELS[n]}`} title={STEP_LABELS[n]} className="group block w-full py-1.5">
              <span
                className={cn(
                  "block h-1 rounded-full transition-all duration-500",
                  index < reached ? "bg-violet-400/80" : index === reached ? "bg-gradient-to-r from-violet-400 to-fuchsia-400" : "bg-white/10 group-hover:bg-white/20"
                )}
              />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

const DEVICE_OPTIONS = [
  { value: "desktop" as const, label: <Monitor className="h-3.5 w-3.5" />, title: "Desktop" },
  { value: "tablet" as const, label: <Tablet className="h-3.5 w-3.5" />, title: "Tablet" },
  { value: "mobile" as const, label: <Smartphone className="h-3.5 w-3.5" />, title: "Mobile" },
];

export function WebsiteStudio() {
  const studio = useWebsiteStudio();
  const { document } = studio;
  const [mode, setMode] = useState<"wizard" | "editor">("wizard");
  const [pageId, setPageId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [fullPreview, setFullPreview] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const booted = useRef(false);
  const formScroll = useRef<HTMLDivElement>(null);

  const goToStep = useCallback(
    (next: number, options?: { path?: WizardPath }) => {
      const doc = studio.getDocument();
      if (!doc) return;
      setMode("wizard");
      const wizardPath = options?.path !== undefined ? options.path : doc.wizardPath;
      studio.change({ ...doc, wizardPath, wizardStep: Math.min(STEP.launch, Math.max(STEP.design, next)) }, { history: false });
      formScroll.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [studio]
  );

  // Initial load, then claim the anonymous draft when returning from sign-up or login.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    void (async () => {
      const { json } = await studio.load();
      const params = new URLSearchParams(window.location.search);
      const accountDoc = json.source === "account";
      if (params.get("claim") === "1") {
        window.history.replaceState(null, "", window.location.pathname);
        if (json.authenticated && !accountDoc) {
          const result = await studio.claim(false);
          if (result.ok) toast.success("Your website is now saved to your Hostvia account");
          else if (result.conflict) toast.message("Your account already has a website", { description: "Choose what to keep in the Launch step." });
          else if (result.error) toast.error(result.error);
        }
        goToStep(STEP.launch);
        return;
      }
      if (params.get("step") === "stays") {
        goToStep(STEP.stays);
        return;
      }
      if (params.get("mode") === "editor" || (accountDoc && params.get("mode") !== "wizard")) setMode("editor");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = Math.min(STEP.launch, Math.max(STEP.design, document?.wizardStep ?? 1));
  const path = document?.wizardPath ?? null;
  const nextStep = neighbourStep(path, step, 1);
  const previousStep = neighbourStep(path, step, -1);
  // The choice screen asks for a decision; it has no Continue button.
  const choosing = step === STEP.quickStart && path !== "ai";

  // Keyboard shortcuts: undo/redo outside text fields, Escape closes the full preview.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "z" && !typing) {
        event.preventDefault();
        if (event.shiftKey) studio.redo();
        else studio.undo();
      }
      if (mod && event.key.toLowerCase() === "y" && !typing) {
        event.preventDefault();
        studio.redo();
      }
      if (event.key === "Escape") setFullPreview(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio]);

  const homeId = document?.pages.find((page) => page.isHome)?.id ?? document?.pages[0]?.id ?? null;
  const activePageId = pageId && document?.pages.some((page) => page.id === pageId) ? pageId : homeId;

  /** Until the host adds photographs, previews borrow the theme's starter photography. */
  const previewDocument = useMemo<WebsiteDocument | null>(() => {
    if (!document) return null;
    if (document.gallery.length) return document;
    return { ...document, gallery: starterPhotos(document.theme) };
  }, [document]);

  const buildModel = useCallback(
    (id: string) => {
      if (!previewDocument) return null;
      const page = previewDocument.pages.find((item) => item.id === id) ?? previewDocument.pages.find((item) => item.isHome);
      if (!page) return null;
      return mergeWebsiteModel({ document: previewDocument, properties: studio.properties, username: "preview", page, preview: true });
    },
    [previewDocument, studio.properties]
  );

  const wizardModel = useMemo(() => (homeId ? buildModel(homeId) : null), [buildModel, homeId]);
  const fullModel = useMemo(() => (activePageId ? buildModel(activePageId) : null), [activePageId, buildModel]);

  if (!document || !wizardModel) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07060a]">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <span className="relative grid h-12 w-12 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
            <Sparkles className="h-5 w-5 text-violet-300" />
          </span>
          <p className="text-[13px]">Opening your website…</p>
        </div>
      </div>
    );
  }

  const stepProps = { studio, document };
  const usingStarter = document.gallery.length === 0;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#07060a] text-zinc-100">
      <header className="z-40 flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#0b0a10]/95 px-2.5 backdrop-blur md:gap-3 md:px-4">
        <Link href="/free-tools/vacation-rental-website-builder" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Back to the website builder page">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1 md:w-56 md:flex-none">
          <p className="truncate text-[13.5px] font-semibold leading-tight text-white">{document.profile.name || "Untitled website"}</p>
          <SaveIndicator state={studio.saveState} error={studio.saveError} onRetry={studio.retrySave} />
        </div>
        <div className="mx-auto hidden w-[230px] md:block">
          <Segmented
            size="sm"
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "wizard", label: <><Sparkles className="h-3.5 w-3.5" /> Guided</> },
              { value: "editor", label: <><PenLine className="h-3.5 w-3.5" /> Editor</> },
            ]}
          />
        </div>
        <div className="flex items-center gap-1 md:w-56 md:justify-end">
          <button type="button" onClick={studio.undo} disabled={!studio.canUndo} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="Undo" title="Undo (⌘Z)">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={studio.redo} disabled={!studio.canRedo} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="Redo" title="Redo (⇧⌘Z)">
            <Redo2 className="h-4 w-4" />
          </button>
          <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => setFullPreview(true)}>
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button size="sm" variant="primary" onClick={() => goToStep(STEP.launch)}>
            <Rocket className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{studio.status === "published" ? "Publish" : "Launch"}</span>
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 justify-center border-b border-white/[0.06] bg-[#0b0a10] p-2 md:hidden">
        <div className="w-[230px]">
          <Segmented size="sm" label="Mode" value={mode} onChange={setMode} options={[{ value: "wizard", label: "Guided" }, { value: "editor", label: "Editor" }]} />
        </div>
      </div>

      {mode === "editor" ? (
        <Editor studio={studio} document={document} buildModel={buildModel} pageId={activePageId ?? ""} onPageChange={setPageId} onConnectStays={() => goToStep(STEP.launch)} />
      ) : (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(400px,480px)_minmax(0,1fr)]">
          <section className="flex min-h-0 flex-col border-r border-white/[0.06] bg-[#0b0a10]">
            <div className="shrink-0 px-5 pt-5 md:px-7">
              <Progress step={step} path={path} onStep={goToStep} />
            </div>
            <div ref={formScroll} className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-7 [scrollbar-width:thin] md:px-7">
              <div key={step} className="wbx-step">
                {step === STEP.design ? <StyleStep {...stepProps} /> : null}
                {step === STEP.quickStart && path === "ai" ? (
                  <QuickStartStep
                    {...stepProps}
                    onDone={(target) => (target === "launch" ? goToStep(STEP.launch) : setMode("editor"))}
                    onManual={() => goToStep(STEP.place, { path: "manual" })}
                  />
                ) : null}
                {choosing ? (
                  <BuildChoice
                    document={document}
                    onChoose={(choice) => (choice === "ai" ? goToStep(STEP.quickStart, { path: "ai" }) : goToStep(STEP.place, { path: "manual" }))}
                  />
                ) : null}
                {step === STEP.place && path === "manual" ? (
                  <button
                    type="button"
                    onClick={() => goToStep(STEP.quickStart, { path: "ai" })}
                    className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] p-3 text-left transition hover:border-violet-400/40"
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-violet-300" />
                    <span className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-zinc-300">
                      <strong className="font-semibold text-white">Rather not type it all?</strong> Paste your Booking.com or Airbnb listing and AI writes the website in a minute.
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-violet-300" />
                  </button>
                ) : null}
                {step === STEP.place ? <PropertyStep {...stepProps} /> : null}
                {step === STEP.photos ? <PhotosStep {...stepProps} /> : null}
                {step === STEP.stays ? <StaysStep {...stepProps} onConnect={() => goToStep(STEP.launch)} /> : null}
                {step === STEP.pages ? <PagesStep {...stepProps} /> : null}
                {step === STEP.look ? <LookStep {...stepProps} /> : null}
                {step === STEP.launch ? <LaunchStep {...stepProps} goTo={goToStep} /> : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.06] px-5 py-3.5 md:px-7">
              <Button variant="ghost" disabled={!previousStep} onClick={() => previousStep && goToStep(previousStep)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <button type="button" onClick={() => setMobilePreview(true)} className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[13px] text-zinc-300 hover:bg-white/5 lg:hidden">
                <Eye className="h-4 w-4" /> Preview
              </button>
              {choosing ? null : nextStep ? (
                <Button variant="primary" className="lg:ml-auto" onClick={() => goToStep(nextStep)}>
                  {step === STEP.design ? `Continue with ${themeMeta(document.theme).name}` : "Continue"} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="secondary" className="lg:ml-auto" onClick={() => setMode("editor")}>
                  <PenLine className="h-4 w-4" /> Open the editor
                </Button>
              )}
            </div>
          </section>

          <section className="relative hidden min-h-0 flex-col bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)] lg:flex">
            <div className="flex h-12 shrink-0 items-center gap-3 px-5">
              <span className="inline-flex items-center gap-2 text-[12px] text-zinc-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live preview
              </span>
              {usingStarter ? <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-500">Starter photography until you add yours</span> : null}
              <div className="ml-auto w-[150px]">
                <Segmented size="sm" label="Device" value={device} onChange={setDevice} options={DEVICE_OPTIONS} />
              </div>
            </div>
            <div className={cn("min-h-0 flex-1", device === "desktop" && "px-5 pt-1")}>
              <PreviewFrame model={wizardModel} device={device} />
            </div>
          </section>
        </div>
      )}

      {fullPreview && fullModel ? (
        <div className="fixed inset-0 z-[180] flex flex-col bg-[#07060a] animate-[wbx-fade_0.3s_ease]">
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-3 md:px-5">
            <p className="hidden text-[13px] text-zinc-400 sm:block">Preview</p>
            <select
              value={activePageId ?? ""}
              onChange={(event) => setPageId(event.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-[#121118] px-2 text-[12.5px] text-zinc-200"
              aria-label="Page"
            >
              {document.pages
                .filter((page) => page.enabled)
                .map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
            </select>
            <div className="mx-auto w-[150px]">
              <Segmented size="sm" label="Device" value={device} onChange={setDevice} options={DEVICE_OPTIONS} />
            </div>
            <span className="hidden items-center gap-1 text-[11px] text-zinc-600 md:flex">
              <Kbd>Esc</Kbd> to close
            </span>
            <button type="button" onClick={() => setFullPreview(false)} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Close preview">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <PreviewFrame model={fullModel} device={device} chrome={device !== "desktop"} />
          </div>
        </div>
      ) : null}

      {mobilePreview ? (
        <div className="fixed inset-0 z-[180] flex flex-col bg-[#07060a] animate-[wbx-fade_0.3s_ease] lg:hidden">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-3">
            <span className="text-[13px] text-zinc-400">Live preview</span>
            <button type="button" onClick={() => setMobilePreview(false)} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/10" aria-label="Close preview">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <PreviewFrame model={wizardModel} device="mobile" chrome={false} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
