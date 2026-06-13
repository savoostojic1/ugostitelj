"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import {
  MAX_PROPERTY_GALLERY,
  removePropertyGalleryImage,
  uploadPropertyGalleryImage,
} from "@/lib/storage/property-assets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PropertyGalleryUploadProps {
  propertyId: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

export function PropertyGalleryUpload({
  propertyId,
  value,
  onChange,
}: PropertyGalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  const atLimit = value.length >= MAX_PROPERTY_GALLERY;
  const coverUrl = value[0];
  const otherUrls = value.slice(1);

  function openFilePicker() {
    if (!uploading && !atLimit) {
      inputRef.current?.click();
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const slotsLeft = MAX_PROPERTY_GALLERY - value.length;
    if (slotsLeft <= 0) {
      toast.error(`Maximum ${MAX_PROPERTY_GALLERY} images`);
      return;
    }

    const batch = files.slice(0, slotsLeft);
    setUploading(true);

    try {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const uploaded: string[] = [];

      for (const file of batch) {
        const url = await uploadPropertyGalleryImage(
          supabase,
          user.id,
          propertyId,
          file
        );
        uploaded.push(url);
      }

      onChange([...value, ...uploaded]);
      toast.success(
        uploaded.length === 1
          ? "Photo added"
          : `${uploaded.length} photos added`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(url: string) {
    setRemovingUrl(url);
    try {
      const supabase = createClient();
      await removePropertyGalleryImage(supabase, url).catch(() => undefined);
      onChange(value.filter((item) => item !== url));
      toast.success("Photo removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemovingUrl(null);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Photos</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            First photo is the cover on your booking site
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium tabular-nums text-zinc-400">
          {value.length}/{MAX_PROPERTY_GALLERY}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {value.length === 0 ? (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-violet-500/30 bg-violet-500/[0.04] px-6 py-10 text-center transition hover:border-violet-500/45 hover:bg-violet-500/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-violet-300" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <Upload className="h-6 w-6" />
              </div>
            )}
            <p className="mt-4 text-sm font-medium text-zinc-200">
              {uploading ? "Uploading…" : "Upload photos"}
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-500">
              JPG, PNG, WebP or GIF · up to 5 MB each · up to{" "}
              {MAX_PROPERTY_GALLERY} photos
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            {coverUrl ? (
              <GalleryImageTile
                url={coverUrl}
                index={0}
                total={value.length}
                isCover
                removing={removingUrl === coverUrl}
                onRemove={() => handleRemove(coverUrl)}
                onMoveLeft={() => moveImage(0, -1)}
                onMoveRight={() => moveImage(0, 1)}
                className="aspect-[16/10] w-full sm:aspect-[21/9]"
              />
            ) : null}

            {otherUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {otherUrls.map((url, offset) => {
                  const index = offset + 1;
                  return (
                    <GalleryImageTile
                      key={url}
                      url={url}
                      index={index}
                      total={value.length}
                      removing={removingUrl === url}
                      onRemove={() => handleRemove(url)}
                      onMoveLeft={() => moveImage(index, -1)}
                      onMoveRight={() => moveImage(index, 1)}
                      className="aspect-[4/3]"
                    />
                  );
                })}
              </div>
            ) : null}

            {!atLimit ? (
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="flex min-h-[88px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/12 bg-white/[0.02] text-sm text-zinc-400 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" />
                    Add more photos
                  </>
                )}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {value.length > 0 ? (
        <p className="text-xs text-zinc-500">
          Use arrows on a photo to change order · first photo stays the cover
        </p>
      ) : null}
    </div>
  );
}

function GalleryImageTile({
  url,
  index,
  total,
  isCover = false,
  removing,
  onRemove,
  onMoveLeft,
  onMoveRight,
  className,
}: {
  url: string;
  index: number;
  total: number;
  isCover?: boolean;
  removing: boolean;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900/50",
        className
      )}
    >
      <Image
        src={url}
        alt=""
        fill
        className="object-cover"
        sizes={isCover ? "(max-width: 768px) 100vw, 640px" : "200px"}
        unoptimized
      />

      {isCover ? (
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          <Star className="h-3 w-3 text-amber-300" />
          Cover photo
        </span>
      ) : null}

      <div className="absolute right-2 top-2 flex gap-1">
        <button
          type="button"
          disabled={index === 0 || removing}
          onClick={onMoveLeft}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-40"
          aria-label="Move earlier"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={index === total - 1 || removing}
          onClick={onMoveRight}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-40"
          aria-label="Move later"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={removing}
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-red-300 backdrop-blur-sm transition hover:bg-red-950/80 disabled:opacity-40"
          aria-label="Remove photo"
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
