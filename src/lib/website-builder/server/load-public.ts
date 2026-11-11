import "server-only";

import { createClient } from "@/lib/supabase/server";
import { currencyCodeFromUnknown } from "@/lib/currency/currencies";
import { normalizeDocument } from "@/lib/website-builder/document-ops";
import { mergeWebsiteModel, pageForSlug } from "@/lib/website-builder/merge-properties";
import type { LivePropertySnapshot, PublicWebsiteModel } from "@/lib/website-builder/types";

interface PublishedPayload {
  username?: string;
  document?: unknown;
  pro?: boolean;
  properties?: unknown;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

function asProperties(value: unknown): LivePropertySnapshot[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.name !== "string") return [];
    const gallery = Array.isArray(row.galleryUrls)
      ? row.galleryUrls.filter((url): url is string => typeof url === "string")
      : [];
    const amenities = Array.isArray(row.amenities)
      ? row.amenities.filter((item): item is string => typeof item === "string")
      : [];
    const price = typeof row.startingPrice === "number" ? row.startingPrice : Number(row.startingPrice);
    return [
      {
        id: row.id,
        slug: typeof row.slug === "string" ? row.slug : null,
        name: row.name,
        shortDescription: typeof row.shortDescription === "string" ? row.shortDescription : null,
        description: typeof row.description === "string" ? row.description : null,
        address: typeof row.address === "string" ? row.address : null,
        imageUrl: typeof row.imageUrl === "string" ? row.imageUrl : null,
        galleryUrls: gallery,
        capacity: typeof row.capacity === "number" ? row.capacity : null,
        amenities,
        startingPrice: Number.isFinite(price) && price > 0 ? price : null,
        currencyCode: currencyCodeFromUnknown(row.currencyCode),
      },
    ];
  });
}

export type PublishedWebsiteLoad =
  | { state: "absent" }
  | { state: "missing-page" }
  | {
      state: "page";
      model: PublicWebsiteModel;
      publishedAt: string | null;
      updatedAt: string | null;
    };

export async function loadPublishedWebsite(
  username: string,
  slugParts: string[]
): Promise<PublishedWebsiteLoad> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_published_website", {
    p_username: username,
  });
  if (error || !data) return { state: "absent" };
  const payload = data as PublishedPayload;
  if (!payload.document || !payload.username) return { state: "absent" };
  const document = normalizeDocument(payload.document);
  const page = pageForSlug(document, slugParts);
  if (!page) return { state: "missing-page" };
  return {
    state: "page",
    publishedAt: payload.publishedAt ?? null,
    updatedAt: payload.updatedAt ?? null,
    model: mergeWebsiteModel({
      document,
      properties: asProperties(payload.properties),
      username: payload.username,
      page,
      pro: payload.pro === true,
    }),
  };
}
