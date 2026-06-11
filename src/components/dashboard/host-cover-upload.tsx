"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import {
  removeHostCoverImage,
  uploadHostCoverImage,
} from "@/lib/storage/host-assets";
import { toast } from "sonner";

interface HostCoverUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function HostCoverUpload({ value, onChange }: HostCoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

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
      <Label>Cover image</Label>

      {value ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={value}
            alt="Booking site cover"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex aspect-[21/9] w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          No cover image
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || removing}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {value ? "Change image" : "Upload image"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || removing}
            onClick={handleRemove}
          >
            {removing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP or GIF · up to 5 MB · recommended 1600×700 px
      </p>
    </div>
  );
}
