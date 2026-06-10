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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const slotsLeft = MAX_PROPERTY_GALLERY - value.length;
    if (slotsLeft <= 0) {
      toast.error(`Maksimalno ${MAX_PROPERTY_GALLERY} slika`);
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
          ? "Slika dodata"
          : `${uploaded.length} slike dodate`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload nije uspio");
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
      toast.success("Slika uklonjena");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Uklanjanje nije uspjelo");
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
      <div className="flex items-center justify-between gap-3">
        <Label>Galerija slika</Label>
        <span className="text-xs text-muted-foreground">
          {value.length}/{MAX_PROPERTY_GALLERY}
        </span>
      </div>

      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 200px"
                unoptimized
              />
              {index === 0 ? (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  <Star className="h-3 w-3" />
                  Naslovna
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-foreground disabled:opacity-40"
                    aria-label="Pomjeri lijevo"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === value.length - 1}
                    onClick={() => moveImage(index, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-foreground disabled:opacity-40"
                    aria-label="Pomjeri desno"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={removingUrl === url}
                  onClick={() => handleRemove(url)}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-red-600"
                  aria-label="Ukloni sliku"
                >
                  {removingUrl === url ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-[2/1] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          Još nema slika za ovu jedinicu
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || atLimit}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {uploading ? "Upload…" : "Dodaj slike"}
        </Button>
      </div>
      <p className={cn("text-xs text-muted-foreground")}>
        Do {MAX_PROPERTY_GALLERY} slika · JPG, PNG, WebP ili GIF · najviše 5 MB
        po slici · prva slika je naslovna na javnom sajtu
      </p>
    </div>
  );
}
