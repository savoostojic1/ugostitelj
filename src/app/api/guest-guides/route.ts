import { NextRequest, NextResponse } from "next/server";
import {
  documentToDbColumns,
  parseGuideBody,
} from "@/lib/guest-guide/api-parse";
import {
  clearDraftTokenCookie,
  getDraftToken,
} from "@/lib/guest-guide/draft-cookie";
import { allocateUniqueGuideSlug } from "@/lib/guest-guide/slug";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("guest_guides")
    .select(
      "id, slug, title, theme, status, cover_image_url, updated_at, published_at"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[guest-guides GET]", error.message);
    return NextResponse.json({ error: "Could not load guides" }, { status: 500 });
  }

  return NextResponse.json({ guides: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const document = parseGuideBody(body);
  const columns = documentToDbColumns(document);
  const publish =
    Boolean(body && typeof body === "object" && "publish" in body
      ? (body as { publish?: unknown }).publish
      : false);

  const status = publish ? "published" : "draft";
  const published_at = publish ? new Date().toISOString() : null;

  let draftId: string | null = null;
  const draftToken = getDraftToken(request);

  if (draftToken && hasServiceRoleKey()) {
    const admin = createServiceClient();
    const { data: draft } = await admin
      .from("guest_guide_drafts")
      .select("id, claimed_at")
      .eq("draft_token", draftToken)
      .maybeSingle();

    if (draft && !draft.claimed_at) {
      draftId = draft.id;
    }
  }

  const slugChecker = hasServiceRoleKey() ? createServiceClient() : supabase;
  const slug = await allocateUniqueGuideSlug(columns.title, async (candidate) => {
    const { data } = await slugChecker
      .from("guest_guides")
      .select("id")
      .ilike("slug", candidate)
      .maybeSingle();
    return Boolean(data);
  });

  const { data: guide, error } = await supabase
    .from("guest_guides")
    .insert({
      user_id: user.id,
      draft_id: draftId,
      slug,
      title: columns.title,
      theme: columns.theme,
      content: columns.content,
      section_order: columns.section_order,
      section_visibility: columns.section_visibility,
      cover_image_url: columns.cover_image_url,
      status,
      published_at,
    })
    .select(
      "id, slug, title, theme, status, cover_image_url, content, section_order, section_visibility, updated_at, published_at, created_at"
    )
    .single();

  if (error || !guide) {
    console.error("[guest-guides POST]", error?.message);
    return NextResponse.json({ error: "Could not create guide" }, { status: 500 });
  }

  if (draftId && draftToken && hasServiceRoleKey()) {
    const admin = createServiceClient();
    await admin
      .from("guest_guide_drafts")
      .update({
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", draftId);
  }

  const response = NextResponse.json({ guide }, { status: 201 });
  if (draftId) {
    clearDraftTokenCookie(response);
  }
  return response;
}
