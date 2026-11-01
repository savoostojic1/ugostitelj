import { NextRequest, NextResponse } from "next/server";
import {
  documentFromDbFields,
  documentToDbColumns,
  guideTitleFromDocument,
} from "@/lib/guest-guide/api-parse";
import {
  clearDraftTokenCookie,
  getDraftToken,
} from "@/lib/guest-guide/draft-cookie";
import { allocateUniqueGuideSlug } from "@/lib/guest-guide/slug";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { requireUser } from "@/lib/supabase/require-user";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

function withAuthCookies(
  target: NextResponse,
  source: NextResponse
): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie.name, cookie.value);
  }
  return target;
}

export async function POST(request: NextRequest) {
  const authResponse = new NextResponse();
  const supabaseAuth = await createRouteHandlerClient(authResponse);

  let user;
  try {
    user = await requireUser(supabaseAuth);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draftToken = getDraftToken(request);
  if (!draftToken) {
    return NextResponse.json({ error: "No draft to claim" }, { status: 400 });
  }

  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      { error: "Claim unavailable without service role" },
      { status: 503 }
    );
  }

  const admin = createServiceClient();
  const { data: draft, error: draftError } = await admin
    .from("guest_guide_drafts")
    .select(
      "id, theme, content, section_order, section_visibility, claimed_at, expires_at"
    )
    .eq("draft_token", draftToken)
    .maybeSingle();

  if (draftError) {
    console.error("[guest-guides/drafts/claim]", draftError.message);
    return NextResponse.json({ error: "Could not load draft" }, { status: 500 });
  }

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  if (draft.claimed_at) {
    return NextResponse.json({ error: "Draft already claimed" }, { status: 409 });
  }

  if (draft.expires_at && new Date(draft.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Draft expired" }, { status: 410 });
  }

  const document = documentFromDbFields(draft);
  const columns = documentToDbColumns(document);
  const title = guideTitleFromDocument(document);

  const slug = await allocateUniqueGuideSlug(title, async (candidate) => {
    const { data } = await admin
      .from("guest_guides")
      .select("id")
      .ilike("slug", candidate)
      .maybeSingle();
    return Boolean(data);
  });

  const now = new Date().toISOString();
  const { data: guide, error: insertError } = await admin
    .from("guest_guides")
    .insert({
      user_id: user.id,
      draft_id: draft.id,
      slug,
      title: columns.title,
      theme: columns.theme,
      content: columns.content,
      section_order: columns.section_order,
      section_visibility: columns.section_visibility,
      cover_image_url: columns.cover_image_url,
      status: "published",
      published_at: now,
    })
    .select("id, slug, status, title")
    .single();

  if (insertError || !guide) {
    console.error("[guest-guides/drafts/claim insert]", insertError?.message);
    return NextResponse.json(
      { error: "Could not create guide" },
      { status: 500 }
    );
  }

  const { error: claimError } = await admin
    .from("guest_guide_drafts")
    .update({
      claimed_by: user.id,
      claimed_at: now,
    })
    .eq("id", draft.id);

  if (claimError) {
    console.error("[guest-guides/drafts/claim mark]", claimError.message);
  }

  const success = NextResponse.json({
    guide: {
      id: guide.id,
      slug: guide.slug,
      status: guide.status,
      title: guide.title,
    },
  });
  withAuthCookies(success, authResponse);
  clearDraftTokenCookie(success);
  return success;
}
