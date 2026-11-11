"use client";

/**
 * Browser-side image helpers for the quick start: collect photographs from a dropped
 * folder, make small thumbnails for the AI to look at, and shrink phone-sized originals
 * before upload so they stay under the upload limit and load fast on the website.
 */

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

export function isUsableImage(file: File): boolean {
  return IMAGE_TYPES.includes(file.type) || (!file.type && IMAGE_EXT.test(file.name));
}

export function isUnsupportedPhoto(file: File): boolean {
  return /\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type);
}

/** Natural order, so IMG_2 comes before IMG_10. Hidden files are skipped. */
export function sortPhotos(files: File[]): File[] {
  return files
    .filter((file) => !file.name.startsWith("."))
    .sort((a, b) => {
      const pathA = (a as File & { webkitRelativePath?: string }).webkitRelativePath || a.name;
      const pathB = (b as File & { webkitRelativePath?: string }).webkitRelativePath || b.name;
      return pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: "base" });
    });
}

type Entry = FileSystemEntry & {
  isFile: boolean;
  isDirectory: boolean;
};

function readEntry(entry: Entry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((resolve) => (entry as FileSystemFileEntry).file((file) => resolve([file]), () => resolve([])));
  }
  if (!entry.isDirectory) return Promise.resolve([]);
  const reader = (entry as FileSystemDirectoryEntry).createReader();
  return new Promise((resolve) => {
    const all: Promise<File[]>[] = [];
    const next = () =>
      reader.readEntries(
        (entries) => {
          if (!entries.length) {
            void Promise.all(all).then((lists) => resolve(lists.flat()));
            return;
          }
          for (const child of entries) all.push(readEntry(child as Entry));
          next();
        },
        () => void Promise.all(all).then((lists) => resolve(lists.flat()))
      );
    next();
  });
}

/** Files from a drop, including everything inside dropped folders. */
export async function filesFromDrop(transfer: DataTransfer): Promise<File[]> {
  const entries = Array.from(transfer.items ?? [])
    .map((item) => (typeof item.webkitGetAsEntry === "function" ? (item.webkitGetAsEntry() as Entry | null) : null))
    .filter((entry): entry is Entry => Boolean(entry));
  if (!entries.length) return Array.from(transfer.files ?? []);
  const lists = await Promise.all(entries.map(readEntry));
  return lists.flat();
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Fall through to an <img> decode.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function draw(source: ImageBitmap | HTMLImageElement, edge: number): HTMLCanvasElement {
  const width = "naturalWidth" in source ? source.naturalWidth : source.width;
  const height = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, edge / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** A small JPEG data URL for the AI to look at. */
export async function thumbnailDataUrl(file: File, edge: number, maxChars: number): Promise<string> {
  const source = await decode(file);
  try {
    let quality = 0.72;
    let size = edge;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const url = draw(source, size).toDataURL("image/jpeg", quality);
      if (url.length <= maxChars) return url;
      quality -= 0.12;
      size = Math.round(size * 0.85);
    }
    throw new Error("Photo too detailed to shrink");
  } finally {
    if ("close" in source) source.close();
  }
}

/** Shrinks large originals to a web-friendly JPEG; small files pass through unchanged. */
export async function prepareForUpload(file: File, maxBytes: number, edge = 2400): Promise<File> {
  if (file.size <= maxBytes * 0.8 && file.size < 2_500_000) return file;
  const source = await decode(file);
  try {
    const canvas = draw(source, edge);
    for (const quality of [0.86, 0.78, 0.68]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= maxBytes) {
        return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, "") + ".jpg", { type: "image/jpeg" });
      }
    }
    return file;
  } finally {
    if ("close" in source) source.close();
  }
}

/** Runs tasks with limited parallelism, keeping results in order. */
export async function mapLimit<T, R>(items: T[], limit: number, task: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
