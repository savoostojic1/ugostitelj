"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Check, ImagePlus, Link2, Loader2, Star, Trash2, UploadCloud, X } from "lucide-react";
import { Button, TextInput } from "@/components/website-builder/ui";
import { cleanImageUrl } from "@/lib/website-builder/sanitize";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { libraryPhotos, starterPhotos, thumbUrl } from "@/lib/website-builder/photo-library";
import { themeMeta } from "@/lib/website-builder/themes";
import type { WebsiteImage, WebsiteThemeId } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";

export interface PendingUpload {
  id: string;
  name: string;
  preview: string;
  status: "uploading" | "error";
  error?: string;
}

/** Uploads files one by one and reports each finished URL. */
export function useUploader(upload: (file: File) => Promise<{ url?: string; error?: string }>) {
  const [pending, setPending] = useState<PendingUpload[]>([]);

  const uploadFiles = useCallback(
    async (files: File[], onDone: (image: WebsiteImage) => void) => {
      const accepted = files.filter((file) => ACCEPT.split(",").includes(file.type));
      if (accepted.length < files.length) toast.error("Only JPG, PNG and WebP photos can be uploaded.");
      const tooBig = accepted.filter((file) => file.size > WEBSITE_LIMITS.uploadBytes);
      if (tooBig.length) toast.error(`${tooBig.length === 1 ? "One photo is" : `${tooBig.length} photos are`} over 5 MB. Export a smaller version and try again.`);
      const queue = accepted
        .filter((file) => file.size <= WEBSITE_LIMITS.uploadBytes)
        .map((file) => ({ file, id: crypto.randomUUID(), preview: URL.createObjectURL(file) }));
      if (!queue.length) return;
      setPending((current) => [
        ...current,
        ...queue.map((item) => ({ id: item.id, name: item.file.name, preview: item.preview, status: "uploading" as const })),
      ]);
      let failed: string | null = null;
      for (const item of queue) {
        const result = await upload(item.file);
        if (result.url) {
          const alt = item.file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
          onDone({ url: result.url, alt });
          setPending((current) => current.filter((entry) => entry.id !== item.id));
          URL.revokeObjectURL(item.preview);
        } else {
          failed = result.error ?? "Upload failed";
          setPending((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "error", error: failed! } : entry)));
        }
      }
      if (failed) toast.error(failed);
    },
    [upload]
  );

  const dismiss = useCallback((id: string) => {
    setPending((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return current.filter((entry) => entry.id !== id);
    });
  }, []);

  return { pending, uploadFiles, dismiss };
}

export function Dropzone({
  onFiles,
  children,
  compact,
  multiple = true,
}: {
  onFiles: (files: File[]) => void;
  children?: ReactNode;
  compact?: boolean;
  multiple?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const files = Array.from(event.dataTransfer.files ?? []);
        if (files.length) onFiles(files);
      }}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed text-center transition",
        compact ? "gap-1.5 px-4 py-5" : "gap-3 px-6 py-10",
        over ? "border-violet-400 bg-violet-500/10" : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
      )}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          input.current?.click();
        }
      }}
    >
      <span className={cn("grid place-items-center rounded-full bg-white/[0.06] text-violet-200 transition group-hover:scale-105", compact ? "h-9 w-9" : "h-12 w-12")}>
        <UploadCloud className={compact ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      {children ?? (
        <>
          <p className="text-[14px] font-medium text-zinc-200">Drop photographs here, or click to choose</p>
          <p className="text-[12px] text-zinc-500">JPG, PNG or WebP, up to 5 MB each</p>
        </>
      )}
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

/** Gallery grid: the first photograph is the cover. Drag to reorder. */
export function PhotoGrid({
  images,
  pending,
  onReorder,
  onRemove,
  onCover,
  onDismiss,
}: {
  images: WebsiteImage[];
  pending: PendingUpload[];
  onReorder: (images: WebsiteImage[]) => void;
  onRemove: (url: string) => void;
  onCover: (url: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  if (!images.length && !pending.length) return null;
  return (
    <ul className="grid grid-cols-3 gap-2.5">
      {images.map((image, index) => (
        <li
          key={image.url}
          draggable
          onDragStart={() => setDrag(index)}
          onDragOver={(event) => {
            event.preventDefault();
            setOver(index);
          }}
          onDragEnd={() => {
            setDrag(null);
            setOver(null);
          }}
          onDrop={(event) => {
            event.preventDefault();
            if (drag === null || drag === index) return;
            const next = images.slice();
            const [moved] = next.splice(drag, 1);
            next.splice(index, 0, moved);
            onReorder(next);
            setDrag(null);
            setOver(null);
          }}
          className={cn(
            "group relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition active:cursor-grabbing",
            index === 0 && "col-span-2 row-span-2 aspect-auto",
            over === index && drag !== index && "ring-2 ring-violet-400",
            drag === index && "opacity-40"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbUrl(image.url, index === 0 ? 900 : 420)} alt={image.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" draggable={false} />
          {index === 0 ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10.5px] font-semibold text-white backdrop-blur">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> Cover
            </span>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            {index !== 0 ? (
              <button type="button" onClick={() => onCover(image.url)} className="rounded-lg bg-black/60 px-2 py-1 text-[11px] font-medium text-white hover:bg-black/80" title="Use as cover">
                Make cover
              </button>
            ) : null}
            <button type="button" onClick={() => onRemove(image.url)} className="grid h-6 w-6 place-items-center rounded-lg bg-black/60 text-white hover:bg-rose-600" aria-label="Remove photograph">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </li>
      ))}
      {pending.map((item) => (
        <li key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.preview} alt="" className={cn("h-full w-full object-cover", item.status === "uploading" ? "opacity-50" : "opacity-30 grayscale")} />
          <div className="absolute inset-0 grid place-items-center">
            {item.status === "uploading" ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <button type="button" onClick={() => onDismiss(item.id)} className="flex items-center gap-1 rounded-full bg-rose-600/90 px-2 py-1 text-[11px] text-white" title={item.error}>
                Failed <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Modal for choosing a single photograph: from the site, the library, an upload or a link. */
export function ImagePicker({
  open,
  onClose,
  onPick,
  ownPhotos,
  theme,
  upload,
  title = "Choose a photograph",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (image: WebsiteImage) => void;
  ownPhotos: WebsiteImage[];
  theme: WebsiteThemeId;
  upload: (file: File) => Promise<{ url?: string; error?: string }>;
  title?: string;
}) {
  const [tab, setTab] = useState<"yours" | "library" | "link">(ownPhotos.length ? "yours" : "library");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const library = libraryPhotos();
  const ordered = [
    ...library.filter((item) => item.theme === theme),
    ...library.filter((item) => item.theme !== theme),
  ];

  const pick = (image: WebsiteImage) => {
    onPick(image);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111017] text-zinc-100 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1 border-b border-white/10 px-4 pt-2">
          {(
            [
              ["yours", "Your photos"],
              ["library", "Photo library"],
              ["link", "Image link"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn("relative px-3 py-2.5 text-[13px] font-medium transition", tab === id ? "text-white" : "text-zinc-500 hover:text-zinc-200")}
            >
              {label}
              {tab === id ? <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-violet-400" /> : null}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === "yours" ? (
            <div className="space-y-4">
              <Dropzone
                compact
                multiple={false}
                onFiles={async (files) => {
                  setBusy(true);
                  const result = await upload(files[0]);
                  setBusy(false);
                  if (result.url) pick({ url: result.url, alt: files[0].name.replace(/\.[a-z0-9]+$/i, "") });
                  else toast.error(result.error ?? "Upload failed");
                }}
              >
                <p className="text-[13px] font-medium text-zinc-200">{busy ? "Uploading…" : "Upload a new photograph"}</p>
              </Dropzone>
              {ownPhotos.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {ownPhotos.map((image) => (
                    <PickTile key={image.url} image={image} onPick={pick} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-[13px] text-zinc-500">No photographs yet. Upload one, or choose from the library.</p>
              )}
            </div>
          ) : null}
          {tab === "library" ? (
            <div>
              <p className="mb-3 text-[12.5px] text-zinc-500">Free photographs to start with. Replace them with your own before you publish.</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {ordered.map(({ image }) => (
                  <PickTile key={image.url} image={image} onPick={pick} />
                ))}
              </div>
            </div>
          ) : null}
          {tab === "link" ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                const url = cleanImageUrl(link);
                if (!url) {
                  toast.error("Paste a full https:// link to a JPG, PNG or WebP image.");
                  return;
                }
                pick({ url, alt: "" });
              }}
            >
              <p className="text-[13px] text-zinc-400">Paste the address of an image you have the right to use.</p>
              <div className="flex gap-2">
                <TextInput value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://…" type="url" />
                <Button type="submit" variant="primary">
                  <Link2 className="h-4 w-4" /> Use
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

function PickTile({ image, onPick }: { image: WebsiteImage; onPick: (image: WebsiteImage) => void }) {
  return (
    <button type="button" onClick={() => onPick(image)} className="group relative aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-white/10 hover:ring-2 hover:ring-violet-400">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbUrl(image.url, 400)} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-violet-500 text-white opacity-0 transition group-hover:opacity-100">
        <Check className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export function StarterPhotosButton({ theme, onUse }: { theme: WebsiteThemeId; onUse: (images: WebsiteImage[]) => void }) {
  return (
    <button
      type="button"
      onClick={() => onUse(starterPhotos(theme))}
      className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
    >
      <span className="flex -space-x-3">
        {starterPhotos(theme)
          .slice(0, 3)
          .map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image.url} src={thumbUrl(image.url, 120)} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0c0b10]" />
          ))}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium text-zinc-100">Start with {themeMeta(theme).name} photography</span>
        <span className="block text-[12px] text-zinc-500">See the design come alive now. Swap in your own photos any time.</span>
      </span>
      <ImagePlus className="h-4 w-4 text-zinc-500 transition group-hover:text-zinc-200" />
    </button>
  );
}
