import { NextRequest, NextResponse } from "next/server";
import { isValidGuideSlug, slugifyGuideTitle } from "@/lib/guest-guide/slug";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("slug")?.trim() ?? "";
  if (!raw) {
    return NextResponse.json({ available: false });
  }

  const slug = slugifyGuideTitle(raw);
  if (!isValidGuideSlug(slug)) {
    return NextResponse.json({ available: false, slug });
  }

  const supabase = hasServiceRoleKey()
    ? createServiceClient()
    : await createClient();

  const { data, error } = await supabase
    .from("guest_guides")
    .select("id")
    .ilike("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[guest-guides/slug/check]", error.message);
    return NextResponse.json({ error: "Could not check slug" }, { status: 500 });
  }

  return NextResponse.json({
    available: !data,
    slug,
  });
}
