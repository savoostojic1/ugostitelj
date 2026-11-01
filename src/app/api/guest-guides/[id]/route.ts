import { NextRequest, NextResponse } from "next/server";
import {
  documentFromDbFields,
  documentToDbColumns,
  isGuestGuideStatus,
  parseGuideBody,
} from "@/lib/guest-guide/api-parse";
import { isValidGuideSlug, slugifyGuideTitle } from "@/lib/guest-guide/slug";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ id: string }> };

const GUIDE_SELECT =
  "id, slug, title, theme, status, cover_image_url, content, section_order, section_visibility, updated_at, published_at, created_at, draft_id, property_id";

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("guest_guides")
    .select(GUIDE_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[guest-guides/[id] GET]", error.message);
    return NextResponse.json({ error: "Could not load guide" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    guide: {
      ...data,
      document: documentFromDbFields(data),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("guest_guides")
    .select(GUIDE_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: "Could not load guide" }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  const hasDocumentFields =
    raw.theme !== undefined ||
    raw.content !== undefined ||
    raw.sectionOrder !== undefined ||
    raw.sectionVisibility !== undefined ||
    raw.section_order !== undefined ||
    raw.section_visibility !== undefined;

  if (hasDocumentFields) {
    const current = documentFromDbFields(existing);
    const merged = parseGuideBody({
      theme: raw.theme ?? current.theme,
      content: raw.content ?? current.content,
      sectionOrder: raw.sectionOrder ?? raw.section_order ?? current.sectionOrder,
      sectionVisibility:
        raw.sectionVisibility ??
        raw.section_visibility ??
        current.sectionVisibility,
    });
    const columns = documentToDbColumns(merged);
    updates.theme = columns.theme;
    updates.content = columns.content;
    updates.section_order = columns.section_order;
    updates.section_visibility = columns.section_visibility;
    updates.title = columns.title;
    updates.cover_image_url = columns.cover_image_url;
  }

  if (typeof raw.title === "string" && raw.title.trim()) {
    updates.title = raw.title.trim();
  }

  if (typeof raw.slug === "string") {
    const slug = slugifyGuideTitle(raw.slug);
    if (!isValidGuideSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const checker = hasServiceRoleKey() ? createServiceClient() : supabase;
    const { data: taken } = await checker
      .from("guest_guides")
      .select("id")
      .ilike("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (taken) {
      return NextResponse.json({ error: "Slug unavailable" }, { status: 409 });
    }

    updates.slug = slug;
  }

  if (raw.status !== undefined) {
    if (!isGuestGuideStatus(raw.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = raw.status;
    if (raw.status === "published" && !existing.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({
      guide: {
        ...existing,
        document: documentFromDbFields(existing),
      },
    });
  }

  const { data, error } = await supabase
    .from("guest_guides")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(GUIDE_SELECT)
    .single();

  if (error || !data) {
    console.error("[guest-guides/[id] PATCH]", error?.message);
    return NextResponse.json({ error: "Could not update guide" }, { status: 500 });
  }

  return NextResponse.json({
    guide: {
      ...data,
      document: documentFromDbFields(data),
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("guest_guides")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: "Could not load guide" }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("guest_guides")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[guest-guides/[id] DELETE]", error.message);
    return NextResponse.json({ error: "Could not delete guide" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
