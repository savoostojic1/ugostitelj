import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveGoogleMapsInput } from "@/lib/public/google-maps-embed";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!url) {
    return NextResponse.json({ error: "Nedostaje link" }, { status: 400 });
  }

  try {
    const embedUrl = await resolveGoogleMapsInput(url);
    if (!embedUrl) {
      return NextResponse.json(
        { error: "Link nije prepoznat kao Google mapa" },
        { status: 400 }
      );
    }

    return NextResponse.json({ embedUrl });
  } catch {
    return NextResponse.json(
      { error: "Mapa nije mogla biti učitana" },
      { status: 400 }
    );
  }
}
