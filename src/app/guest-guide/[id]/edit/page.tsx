import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GuestGuideBuilderShell } from "@/components/guest-guide/builder/builder-shell";
import { createEmptyGuideDocument } from "@/lib/guest-guide/defaults";
import { guestGuideFontClassNames } from "@/lib/guest-guide/fonts";
import {
  isGuestGuideSectionId,
  isGuestGuideTheme,
  type GuestGuideDocument,
  type GuestGuideSectionId,
} from "@/lib/guest-guide/types";
import { createClient } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata(
  "Edit guest guide",
  "Edit your Hostvia digital guest guide."
);

type Props = { params: Promise<{ id: string }> };

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
    theme,
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

export default async function EditGuestGuidePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/guest-guide/${id}/edit`)}`);

  const { data, error } = await supabase
    .from("guest_guides")
    .select("id, theme, content, section_order, section_visibility, user_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !data || data.user_id !== user.id) notFound();

  return (
    <div className={guestGuideFontClassNames()}>
      <GuestGuideBuilderShell
        initialGuideId={data.id}
        initialDocument={toDocument(data)}
      />
    </div>
  );
}
