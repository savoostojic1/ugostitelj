import { NextRequest, NextResponse } from "next/server";
import {
  documentFromDbFields,
  documentToDbColumns,
  parseGuideBody,
} from "@/lib/guest-guide/api-parse";
import {
  getDraftToken,
  setDraftTokenCookie,
} from "@/lib/guest-guide/draft-cookie";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

function newDraftToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export async function GET(request: NextRequest) {
  const token = getDraftToken(request);
  if (!token) {
    return NextResponse.json({ document: null });
  }

  if (!hasServiceRoleKey()) {
    return NextResponse.json({ document: null });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("guest_guide_drafts")
    .select(
      "id, theme, content, section_order, section_visibility, claimed_at, expires_at, updated_at"
    )
    .eq("draft_token", token)
    .maybeSingle();

  if (error) {
    console.error("[guest-guides/drafts GET]", error.message);
    return NextResponse.json({ error: "Could not load draft" }, { status: 500 });
  }

  if (!data || data.claimed_at) {
    return NextResponse.json({ document: null });
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ document: null });
  }

  return NextResponse.json({
    id: data.id,
    updatedAt: data.updated_at,
    document: documentFromDbFields(data),
  });
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const document = parseGuideBody(body);
  const columns = documentToDbColumns(document);

  if (!hasServiceRoleKey()) {
    return NextResponse.json({ id: null, persisted: false, document });
  }

  const supabase = createServiceClient();
  const existingToken = getDraftToken(request);

  if (existingToken) {
    const { data: existing, error: existingError } = await supabase
      .from("guest_guide_drafts")
      .select("id, claimed_at")
      .eq("draft_token", existingToken)
      .maybeSingle();

    if (existingError) {
      console.error("[guest-guides/drafts PUT lookup]", existingError.message);
      return NextResponse.json(
        { error: "Could not save draft" },
        { status: 500 }
      );
    }

    if (existing && !existing.claimed_at) {
      const { data, error } = await supabase
        .from("guest_guide_drafts")
        .update({
          theme: columns.theme,
          content: columns.content,
          section_order: columns.section_order,
          section_visibility: columns.section_visibility,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", existing.id)
        .select("id, theme, content, section_order, section_visibility")
        .single();

      if (error || !data) {
        console.error("[guest-guides/drafts PUT update]", error?.message);
        return NextResponse.json(
          { error: "Could not save draft" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        id: data.id,
        document: documentFromDbFields(data),
        persisted: true,
      });
    }
  }

  const token = newDraftToken();
  const { data, error } = await supabase
    .from("guest_guide_drafts")
    .insert({
      draft_token: token,
      theme: columns.theme,
      content: columns.content,
      section_order: columns.section_order,
      section_visibility: columns.section_visibility,
    })
    .select("id, theme, content, section_order, section_visibility")
    .single();

  if (error || !data) {
    console.error("[guest-guides/drafts PUT insert]", error?.message);
    return NextResponse.json({ error: "Could not save draft" }, { status: 500 });
  }

  const response = NextResponse.json({
    id: data.id,
    document: documentFromDbFields(data),
    persisted: true,
  });
  setDraftTokenCookie(response, token);
  return response;
}
