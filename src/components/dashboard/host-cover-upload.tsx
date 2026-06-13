"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import {
  removeHostCoverImage,
  uploadHostCoverImage,
} from "@/lib/storage/host-assets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HostCoverUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function HostCoverUpload({ value, onChange }: HostCoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const busy = uploading || removing;

  function openFilePicker() {
    if (!busy) inputRef.current?.click();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const url = await uploadHostCoverImage(supabase, user.id, file);
      onChange(url);
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      const supabase = createClient();
      const user = await requireUser(supabase);
      await removeHostCoverImage(supabase, user.id);
      onChange("");
      toast.success("Cover image removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-white">Cover image</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Wide banner at the top of your public booking site
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileSelect}
        />

        {value ? (
          <div className="space-y-3">
            <div className="group relative aspect-[21/9] w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900/50">
              <Image
                src={value}
                alt="Booking site cover"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 720px"
                unoptimized
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={openFilePicker}
                  className="flex h-8 items-center gap-1.5 rounded-md bg-black/55 px-2.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-40"
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  Change
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleRemove}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-red-300 backdrop-blur-sm transition hover:bg-red-950/80 disabled:opacity-40"
                  aria-label="Remove cover image"
                >
                  {removing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={openFilePicker}
              disabled={busy}
              className={cn(
                "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/12 bg-white/[0.02] text-sm text-zinc-400 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  Replace cover image
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="flex aspect-[21/9] w-full flex-col items-center justify-center rounded-lg border border-dashed border-violet-500/30 bg-violet-500/[0.04] px-6 py-8 text-center transition hover:border-violet-500/45 hover:bg-violet-500/[0.07] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[160px]"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-violet-300" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <Upload className="h-6 w-6" />
              </div>
            )}
            <p className="mt-4 text-sm font-medium text-zinc-200">
              {uploading ? "Uploading…" : "Upload cover image"}
            </p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">
              JPG, PNG, WebP or GIF · up to 5 MB · recommended 1600×700 px
            </p>
          </button>
        )}
      </div>

      {value ? (
        <p className="text-xs text-zinc-500">
          This image appears as the hero banner when guests open your booking
          site
        </p>
      ) : null}
    </div>
  );
}
