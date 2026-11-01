import "server-only";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { createEmptyGuideDocument } from "@/lib/guest-guide/defaults";
import {
  isGuestGuideSectionId,
  isGuestGuideTheme,
  type GuestGuideDocument,
  type GuestGuideSectionId,
  type GuestGuideTheme,
} from "@/lib/guest-guide/types";

export interface PublicGuestGuide {
  slug: string;
  title: string;
  document: GuestGuideDocument;
  coverImageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

function toDocument(row: {
  theme: string;
  content: unknown;
  section_order: unknown;
  section_visibility: unknown;
}): GuestGuideDocument {
  const fallback = createEmptyGuideDocument();
  const theme =
    typeof row.theme === "string" && isGuestGuideTheme(row.theme)
      ? row.theme
      : fallback.theme;

  const order = Array.isArray(row.section_order)
    ? (row.section_order.filter(isGuestGuideSectionId) as GuestGuideSectionId[])
    : fallback.sectionOrder;

  return {
    theme: theme as GuestGuideTheme,
    content: {
      ...fallback.content,
      ...(row.content && typeof row.content === "object"
        ? (row.content as object)
        : {}),
    } as GuestGuideDocument["content"],
    sectionOrder: order.length ? order : fallback.sectionOrder,
    sectionVisibility: {
      ...fallback.sectionVisibility,
      ...(row.section_visibility && typeof row.section_visibility === "object"
        ? (row.section_visibility as object)
        : {}),
    } as GuestGuideDocument["sectionVisibility"],
  };
}

export async function getPublicGuestGuide(
  slug: string
): Promise<PublicGuestGuide | null> {
  if (!hasServiceRoleKey()) {
    // Fallback: anon RPC via browser-less fetch isn't available; try service-less path.
    return null;
  }

  const admin = createServiceClient();
  const { data, error } = await admin.rpc("get_public_guest_guide", {
    p_slug: slug,
  });

  if (error || !data) return null;

  const row = data as {
    slug: string;
    title: string;
    theme: string;
    content: unknown;
    section_order: unknown;
    section_visibility: unknown;
    cover_image_url: string | null;
    published_at: string | null;
    updated_at: string;
  };

  return {
    slug: row.slug,
    title: row.title,
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    document: toDocument(row),
  };
}
