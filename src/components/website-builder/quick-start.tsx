"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ClipboardPaste,
  FolderOpen,
  ImagePlus,
  Laptop,
  Loader2,
  Monitor,
  PenLine,
  RotateCcw,
  Smartphone,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import {
  filesFromDrop,
  isUnsupportedPhoto,
  isUsableImage,
  mapLimit,
  prepareForUpload,
  sortPhotos,
  thumbnailDataUrl,
} from "@/components/website-builder/image-prep";
import { Button, Field, Label, Select, SectionTitle } from "@/components/website-builder/ui";
import { withProfile } from "@/lib/website-builder/document-ops";
import type { StepProps } from "@/components/website-builder/wizard-steps";
import { LANGUAGE_NAMES } from "@/components/website-builder/wizard-steps";
import { addRetriedPhotos, applyQuickStart, QUICK_START_LIMITS, tidyListingText, type QuickStartResult } from "@/lib/website-builder/ai/quick-start";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { themeMeta } from "@/lib/website-builder/themes";
import { WEBSITE_LANGUAGES, type WebsiteLanguage } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";

type Device = "windows" | "mac" | "phone";

function detectDevice(): Device {
  if (typeof navigator === "undefined") return "windows";
  const agent = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(agent)) return "phone";
  if (/Mac/i.test(agent)) return "mac";
  return "windows";
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-white/15 border-b-white/25 bg-white/[0.08] px-1.5 font-sans text-[11.5px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.12)]">
      {children}
    </kbd>
  );
}

function CopyGuide({ device, onDevice }: { device: Device; onDevice: (device: Device) => void }) {
  const mod = device === "mac" ? "⌘ Cmd" : "Ctrl";
  const steps: React.ReactNode[] =
    device === "phone"
      ? [
          <>Open your listing in the phone&apos;s <strong className="text-white">browser</strong> (Safari or Chrome), not the app.</>,
          <>Tap <strong className="text-white">Show more</strong> under the description so all of it is on the page.</>,
          <>Press and hold on the text, tap <strong className="text-white">Select all</strong>, then <strong className="text-white">Copy</strong>.</>,
          <>Come back here and tap <strong className="text-white">Paste my listing</strong>.</>,
        ]
      : [
          <>Open your property page on <strong className="text-white">Booking.com</strong> or <strong className="text-white">Airbnb</strong> and click <strong className="text-white">Show more</strong> under the description.</>,
          <>Click once on an empty spot of the page, then press <Key>{mod}</Key>+<Key>A</Key> to select everything.</>,
          <>Press <Key>{mod}</Key>+<Key>C</Key> to copy.</>,
          <>Come back here and click <strong className="text-white">Paste my listing</strong>, or click the box and press <Key>{mod}</Key>+<Key>V</Key>.</>,
        ];
  const tabs: { id: Device; label: string; icon: React.ReactNode }[] = [
    { id: "windows", label: "Windows", icon: <Monitor className="h-3.5 w-3.5" /> },
    { id: "mac", label: "Mac", icon: <Laptop className="h-3.5 w-3.5" /> },
    { id: "phone", label: "Phone", icon: <Smartphone className="h-3.5 w-3.5" /> },
  ];
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="shrink-0 text-[13px] font-semibold text-zinc-100">How to copy your listing</p>
        <div className="flex rounded-lg bg-black/30 p-0.5" role="tablist" aria-label="Your device">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={device === tab.id}
              onClick={() => onDevice(tab.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium transition",
                device === tab.id ? "bg-white/[0.12] text-white" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <ol className="space-y-2.5">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3 text-[13px] leading-[1.6] text-zinc-300">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-200">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 border-t border-white/[0.06] pt-3 text-[12px] leading-relaxed text-zinc-500">
        Menus, prices and reviews will come along too. That is fine: they are left out automatically. Copy only a listing that is yours.
      </p>
    </div>
  );
}

interface Picked {
  file: File;
  preview: string;
}

const PROGRESS = ["Reading your listing", "Looking at your photographs", "Writing in your design's voice", "Composing your pages"];

export function QuickStartStep({ studio, document, onDone, onManual }: StepProps & { onDone: (target: "launch" | "editor") => void; onManual: () => void }) {
  const [device, setDevice] = useState<Device>("windows");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<WebsiteLanguage | "auto">("auto");
  const [photos, setPhotos] = useState<Picked[]>([]);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(0);
  const [uploaded, setUploaded] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ result: QuickStartResult; files: File[]; photoUrls: (string | null)[]; uploadError: string | null } | null>(null);
  const [retrying, setRetrying] = useState(false);
  // Finished uploads survive a second attempt, so trying again never re-uploads a photo.
  const uploadedUrls = useRef(new Map<string, string>());
  const lastUploadError = useRef<string | null>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const filesInput = useRef<HTMLInputElement>(null);
  const meta = themeMeta(document.theme);

  useEffect(() => setDevice(detectDevice()), []);
  useEffect(() => {
    folderInput.current?.setAttribute("webkitdirectory", "");
    folderInput.current?.setAttribute("directory", "");
  }, []);
  // Previews are revoked when the step closes; removed ones stay cheap until then.
  const previews = useRef<string[]>([]);
  previews.current = photos.map((photo) => photo.preview);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);
  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(() => setPhase((current) => Math.min(PROGRESS.length - 1, current + 1)), 9000);
    return () => window.clearInterval(timer);
  }, [busy]);

  const tidy = useMemo(() => tidyListingText(text), [text]);
  const enough = tidy.length >= QUICK_START_LIMITS.minChars;
  const tooLong = tidy.length > QUICK_START_LIMITS.maxChars;

  const addFiles = (files: File[]) => {
    const heic = files.filter(isUnsupportedPhoto).length;
    if (heic) toast.error(`${heic === 1 ? "One iPhone photo (HEIC) was" : `${heic} iPhone photos (HEIC) were`} skipped. Export them as JPG first.`);
    const usable = sortPhotos(files.filter(isUsableImage));
    if (!usable.length) {
      if (!heic) toast.error("No JPG, PNG or WebP photos found there.");
      return;
    }
    setPhotos((current) => {
      const seen = new Set(current.map((photo) => `${photo.file.name}:${photo.file.size}`));
      const fresh = usable.filter((file) => !seen.has(`${file.name}:${file.size}`));
      const room = QUICK_START_LIMITS.photos - current.length;
      if (fresh.length > room) toast.message(`The first ${QUICK_START_LIMITS.photos} photos are used.`, { description: "You can change the selection later in Photos." });
      return [...current, ...fresh.slice(0, Math.max(0, room)).map((file) => ({ file, preview: URL.createObjectURL(file) }))];
    });
  };

  const paste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip.trim()) {
        toast.error("Your clipboard is empty. Copy the listing first.");
        return;
      }
      setText(clip);
      setError(null);
    } catch {
      toast.message("Click the box below and press Ctrl+V (or ⌘+V on Mac) to paste.");
    }
  };

  const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

  async function uploadOne(file: File): Promise<string | null> {
    const cached = uploadedUrls.current.get(fileKey(file));
    if (cached) {
      setUploaded((count) => count + 1);
      return cached;
    }
    const ready = await prepareForUpload(file, WEBSITE_LIMITS.uploadBytes).catch(() => file);
    const outcome = await studio.upload(ready);
    if (!outcome.url) {
      lastUploadError.current = outcome.error ?? "Upload failed";
      return null;
    }
    uploadedUrls.current.set(fileKey(file), outcome.url);
    setUploaded((count) => count + 1);
    return outcome.url;
  }

  /** The first upload runs alone so an anonymous draft is created once, then three at a time. */
  async function uploadAll(files: File[]): Promise<(string | null)[]> {
    if (!files.length) return [];
    const first = await uploadOne(files[0]);
    const rest = await mapLimit(files.slice(1), 3, (file) => uploadOne(file));
    return [first, ...rest];
  }

  async function retryUploads() {
    if (!done || retrying) return;
    setRetrying(true);
    lastUploadError.current = null;
    const photoUrls = await mapLimit(done.files, 3, async (file, index) => done.photoUrls[index] ?? uploadOne(file));
    const added = photoUrls.filter((url, index) => url && !done.photoUrls[index]).length;
    if (added) {
      const latest = studio.getDocument() ?? document;
      studio.change(addRetriedPhotos(latest, done.result, photoUrls));
      toast.success(`${added} ${added === 1 ? "photo" : "photos"} added to your website`);
    }
    setDone({ ...done, photoUrls, uploadError: photoUrls.some((url) => !url) ? lastUploadError.current : null });
    setRetrying(false);
  }

  async function create() {
    if (!enough || tooLong || busy) return;
    setBusy(true);
    setPhase(0);
    setUploaded(0);
    setError(null);
    const files = photos.map((photo) => photo.file);
    lastUploadError.current = null;
    try {
      // Upload originals and ask for the copy at the same time.
      const uploads = uploadAll(files);
      const thumbnails = await mapLimit(files, 4, (file) =>
        thumbnailDataUrl(file, QUICK_START_LIMITS.photoEdge, QUICK_START_LIMITS.photoBytes).catch(() => null)
      );
      const readable = thumbnails.map((thumb, index) => ({ thumb, index })).filter((entry): entry is { thumb: string; index: number } => Boolean(entry.thumb));
      const response = await fetch("/api/website-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingText: tidy, theme: document.theme, language, photos: readable.map((entry) => entry.thumb) }),
      });
      const json = (await response.json().catch(() => ({}))) as { result?: QuickStartResult; error?: string; code?: string; detail?: string };
      if (!response.ok || !json.result) {
        const message = json.error ?? `Something went wrong while writing your website (status ${response.status}). Please try again.`;
        const extra = [json.code ? `code: ${json.code}` : "", json.detail ?? ""].filter(Boolean).join(" · ");
        setError(extra ? `${message} (${extra})` : message);
        await uploads;
        return;
      }
      const urls = await uploads;
      // The model saw only the readable photos; map its numbering back to the uploads.
      const photoUrls = readable.map((entry) => urls[entry.index] ?? null);
      const latest = studio.getDocument() ?? document;
      studio.change(applyQuickStart(latest, json.result, photoUrls));
      setDone({
        result: json.result,
        files: readable.map((entry) => files[entry.index]),
        photoUrls,
        uploadError: photoUrls.some((url) => !url) ? lastUploadError.current : null,
      });
      toast.success("Your website is written. Have a look at the preview.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const failedUploads = done.photoUrls.filter((url) => !url).length;
    return (
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.08] via-transparent to-violet-500/[0.08] p-6">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-400/15 text-emerald-200">
            <Check className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-white">{done.result.property.name || "Your website"} is ready.</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
            Every page is written in the {meta.name} style{done.result.units.length ? `, with ${done.result.units.length === 1 ? "a page for your stay" : `${done.result.units.length} stays`}` : ""}. Read it through in the preview and change any word you like.
          </p>
        </div>
        {failedUploads ? (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3 text-[12.5px] leading-relaxed text-amber-100/80">
            <p className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {failedUploads === done.files.length ? "Your photos could not be uploaded" : `${failedUploads} of ${done.files.length} photos could not be uploaded`}
                {done.uploadError ? `: ${done.uploadError}` : "."} The text is ready; the photos can follow.
              </span>
            </p>
            <Button size="sm" className="ml-6 mt-2.5" onClick={retryUploads} disabled={retrying}>
              {retrying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              {retrying ? "Uploading…" : "Try the upload again"}
            </Button>
          </div>
        ) : null}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
          <p className="text-[13px] font-semibold text-zinc-100">Before you publish, check</p>
          <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-zinc-400">
            {[...done.result.notes, "Facts such as check-in times and amenities match your listing.", "Prices and availability come from Hostvia once your stays are connected."].map((note) => (
              <li key={note} className="flex gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
                {note}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
          <p className="text-[13px] font-semibold text-zinc-100">Where guests can reach you</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact email" type="email" value={document.profile.contactEmail} onChange={(contactEmail) => studio.change(withProfile(document, { contactEmail }), { coalesce: "profile.email" })} placeholder="you@example.com" />
            <Field label="Phone" type="tel" value={document.profile.contactPhone} onChange={(contactPhone) => studio.change(withProfile(document, { contactPhone }), { coalesce: "profile.phone" })} placeholder="+382 …" />
          </div>
        </div>
        <div className="grid gap-2">
          <Button variant="primary" size="lg" onClick={() => onDone("launch")}>
            Continue to launch <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" onClick={() => onDone("editor")}>
            <PenLine className="h-4 w-4" /> Fine-tune in the editor
          </Button>
        </div>
        <button type="button" className="inline-flex items-center gap-1.5 text-[12.5px] text-zinc-500 hover:text-zinc-200" onClick={() => setDone(null)}>
          <RotateCcw className="h-3.5 w-3.5" /> Write it again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Build with AI"
        title="Paste your listing. We'll write the website."
        description={`Copy the text of your Booking.com or Airbnb listing, add your photo folder, and AI writes every page in the ${meta.name} style. About a minute.`}
      />

      <CopyGuide device={device} onDevice={setDevice} />

      <div>
        <div className="mb-2 flex items-end justify-between gap-2">
          <Label htmlFor="wb-listing">1 · Your listing text</Label>
          <Button size="sm" onClick={paste} disabled={busy}>
            <ClipboardPaste className="h-3.5 w-3.5" /> Paste my listing
          </Button>
        </div>
        <div className="relative">
          <textarea
            id="wb-listing"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError(null);
            }}
            disabled={busy}
            rows={text ? 7 : 4}
            placeholder="Your listing text appears here after you paste it."
            className="w-full resize-y rounded-2xl border border-white/[0.09] bg-white/[0.035] px-4 py-3 text-[13px] leading-relaxed text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60 focus:bg-white/[0.05]"
          />
          {text ? (
            <button type="button" onClick={() => setText("")} disabled={busy} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-zinc-500 hover:bg-white/10 hover:text-white" aria-label="Clear the text">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <p className={cn("mt-1.5 text-[12px]", tooLong ? "text-rose-300" : enough ? "text-emerald-300/80" : "text-zinc-500")} aria-live="polite">
          {tooLong
            ? "That is more than one listing page. Copy only your listing."
            : enough
              ? `Got it · ${tidy.length.toLocaleString()} characters`
              : text
                ? "A little more text is needed. Did you press Show more on the description?"
                : "Nothing pasted yet."}
        </p>
      </div>

      <div>
        <Label hint={photos.length ? `${photos.length} of ${QUICK_START_LIMITS.photos}` : "Optional, recommended"}>2 · Your photos</Label>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setOver(false);
            void filesFromDrop(event.dataTransfer).then(addFiles);
          }}
          className={cn(
            "rounded-2xl border border-dashed p-4 transition",
            over ? "border-violet-400 bg-violet-500/10" : "border-white/15 bg-white/[0.02]"
          )}
        >
          {photos.length ? (
            <div className="grid grid-cols-6 gap-1.5">
              {photos.map((photo, index) => (
                <div key={photo.preview} className="group relative aspect-square overflow-hidden rounded-lg bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                  {!busy ? (
                    <button
                      type="button"
                      onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                      className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Remove ${photo.file.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-3 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.06] text-violet-200">
                <FolderOpen className="h-5 w-5" />
              </span>
              <p className="mt-1 text-[13.5px] font-medium text-zinc-200">Drop your photo folder here</p>
              <p className="text-[12px] text-zinc-500">AI picks the cover, orders them and writes the descriptions.</p>
            </div>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={() => folderInput.current?.click()} disabled={busy || photos.length >= QUICK_START_LIMITS.photos}>
              <FolderOpen className="h-3.5 w-3.5" /> Choose a folder
            </Button>
            <Button size="sm" variant="ghost" onClick={() => filesInput.current?.click()} disabled={busy || photos.length >= QUICK_START_LIMITS.photos}>
              <ImagePlus className="h-3.5 w-3.5" /> Choose photos
            </Button>
            {photos.length ? (
              <Button size="sm" variant="ghost" onClick={() => setPhotos([])} disabled={busy}>
                Remove all
              </Button>
            ) : null}
          </div>
          <input
            ref={folderInput}
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length) addFiles(files);
            }}
          />
          <input
            ref={filesInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length) addFiles(files);
            }}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="wb-ai-language">Website language</Label>
        <Select id="wb-ai-language" value={language} onChange={(event) => setLanguage(event.target.value as WebsiteLanguage | "auto")} disabled={busy}>
          <option value="auto">Same as my listing</option>
          {WEBSITE_LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {LANGUAGE_NAMES[code] ?? code}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <p className="flex gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.07] p-3 text-[12.5px] leading-relaxed text-rose-100/90" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      ) : null}

      {busy ? (
        <div className="rounded-2xl border border-violet-400/25 bg-violet-500/[0.07] p-4" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-violet-200" />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-white">{PROGRESS[phase]}…</p>
              <p className="text-[12px] text-zinc-400">
                {photos.length ? `${uploaded} of ${photos.length} photos uploaded · ` : ""}This takes about a minute. Keep this tab open.
              </p>
            </div>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-[9000ms] ease-linear" style={{ width: `${((phase + 1) / PROGRESS.length) * 92}%` }} />
          </div>
        </div>
      ) : (
        <Button variant="primary" size="lg" className="w-full" onClick={create} disabled={!enough || tooLong}>
          <Wand2 className="h-4 w-4" /> Create my website
        </Button>
      )}

      <p className="text-center text-[12px] leading-relaxed text-zinc-500">
        You can change every word afterwards. Your text is sent to our AI provider only to write this website.{" "}
        <button type="button" onClick={onManual} disabled={busy} className="text-zinc-300 underline-offset-4 hover:underline">
          Fill it in myself instead
        </button>
      </p>
    </div>
  );
}
