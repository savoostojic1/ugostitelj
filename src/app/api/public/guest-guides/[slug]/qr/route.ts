import { NextRequest, NextResponse } from "next/server";
import { GUEST_GUIDE_PUBLIC_PREFIX } from "@/lib/guest-guide/content";
import { generateGuideQrPngBuffer } from "@/lib/guest-guide/qr";
import { absoluteUrl } from "@/lib/seo/site";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { slug } = await context.params;

  if (!hasServiceRoleKey()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const admin = createServiceClient();
  const { data, error } = await admin.rpc("get_public_guest_guide", {
    p_slug: slug,
  });

  if (error) {
    console.error("[public guest-guide qr]", error.message);
    return NextResponse.json({ error: "Could not load guide" }, { status: 500 });
  }

  if (!data || typeof data !== "object" || !("slug" in data)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const guideSlug = String((data as { slug: string }).slug);
  const publicUrl = absoluteUrl(`${GUEST_GUIDE_PUBLIC_PREFIX}/${guideSlug}`);

  try {
    const buffer = await generateGuideQrPngBuffer(publicUrl);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[public guest-guide qr generate]", err);
    return NextResponse.json(
      { error: "Could not generate QR code" },
      { status: 500 }
    );
  }
}
