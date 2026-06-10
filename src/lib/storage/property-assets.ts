import type { SupabaseClient } from "@supabase/supabase-js";
import {
  HOST_ASSETS_BUCKET,
  validateHostCoverFile,
} from "@/lib/storage/host-assets";

export const MAX_PROPERTY_GALLERY = 10;

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export function storagePathFromPublicUrl(url: string): string | null {
  const patterns = [`/${HOST_ASSETS_BUCKET}/`, `/object/public/${HOST_ASSETS_BUCKET}/`];
  for (const marker of patterns) {
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      return url.slice(idx + marker.length).split("?")[0] ?? null;
    }
  }
  return null;
}

export async function uploadPropertyGalleryImage(
  supabase: SupabaseClient,
  userId: string,
  propertyId: string,
  file: File
): Promise<string> {
  const validationError = validateHostCoverFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = extensionForMime(file.type);
  const path = `${userId}/properties/${propertyId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(HOST_ASSETS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(HOST_ASSETS_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function removePropertyGalleryImage(
  supabase: SupabaseClient,
  publicUrl: string
): Promise<void> {
  const path = storagePathFromPublicUrl(publicUrl);
  if (!path) return;

  const { error } = await supabase.storage
    .from(HOST_ASSETS_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}
