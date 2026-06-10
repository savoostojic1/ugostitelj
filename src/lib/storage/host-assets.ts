import type { SupabaseClient } from "@supabase/supabase-js";

export const HOST_ASSETS_BUCKET = "host-assets";

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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

export function validateHostCoverFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Dozvoljeni formati: JPG, PNG, WebP, GIF";
  }
  if (file.size > MAX_COVER_BYTES) {
    return "Slika može biti najviše 5 MB";
  }
  return null;
}

export async function uploadHostCoverImage(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const validationError = validateHostCoverFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = extensionForMime(file.type);
  const path = `${userId}/cover.${ext}`;

  const { error } = await supabase.storage
    .from(HOST_ASSETS_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(HOST_ASSETS_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function removeHostCoverImage(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const folder = `${userId}`;
  const { data: files, error: listError } = await supabase.storage
    .from(HOST_ASSETS_BUCKET)
    .list(folder, { search: "cover." });

  if (listError) {
    throw new Error(listError.message);
  }

  if (!files?.length) return;

  const paths = files.map((file) => `${folder}/${file.name}`);
  const { error } = await supabase.storage
    .from(HOST_ASSETS_BUCKET)
    .remove(paths);

  if (error) {
    throw new Error(error.message);
  }
}
