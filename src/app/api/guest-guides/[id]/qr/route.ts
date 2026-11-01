import { NextRequest, NextResponse } from "next/server";
import { GUEST_GUIDE_PUBLIC_PREFIX } from "@/lib/guest-guide/content";
import { generateGuideQrPngBuffer } from "@/lib/guest-guide/qr";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

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

  const { data: guide, error } = await supabase
    .from("guest_guides")
    .select("id, slug, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[guest-guides/[id]/qr]", error.message);
    return NextResponse.json({ error: "Could not load guide" }, { status: 500 });
  }

  if (!guide) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const publicUrl = absoluteUrl(`${GUEST_GUIDE_PUBLIC_PREFIX}/${guide.slug}`);

  try {
    const buffer = await generateGuideQrPngBuffer(publicUrl);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[guest-guides/[id]/qr generate]", err);
    return NextResponse.json(
      { error: "Could not generate QR code" },
      { status: 500 }
    );
  }
}
