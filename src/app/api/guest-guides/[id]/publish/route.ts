import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const publish =
    body && typeof body === "object" && "publish" in body
      ? Boolean((body as { publish?: unknown }).publish)
      : null;

  if (publish === null) {
    return NextResponse.json(
      { error: "publish boolean required" },
      { status: 400 }
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from("guest_guides")
    .select("id, published_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: "Could not load guide" }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates = publish
    ? {
        status: "published" as const,
        published_at: existing.published_at ?? new Date().toISOString(),
      }
    : {
        status: "unpublished" as const,
      };

  const { data, error } = await supabase
    .from("guest_guides")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, slug, status, title, published_at")
    .single();

  if (error || !data) {
    console.error("[guest-guides/[id]/publish]", error?.message);
    return NextResponse.json(
      { error: "Could not update publish state" },
      { status: 500 }
    );
  }

  return NextResponse.json({ guide: data });
}
