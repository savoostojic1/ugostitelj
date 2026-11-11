import { NextResponse } from "next/server";
import { normalizeDocument } from "@/lib/website-builder/document-ops";
import {
  loadOwnedWebsite,
  publishOwnedWebsite,
  unpublishOwnedWebsite,
  websiteAdmin,
  websiteServiceAvailable,
} from "@/lib/website-builder/server/repository";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { requireUser } from "@/lib/supabase/require-user";
import { resolveBillingHostId } from "@/lib/subscriptions/resolve-host-subscription";
import { getBookingSiteUrl } from "@/lib/public/booking-site-url";

async function owner() {
  const authResponse = new NextResponse();
  const supabase = await createRouteHandlerClient(authResponse);
  const user = await requireUser(supabase);
  const billing = await resolveBillingHostId(supabase, user.id);
  return { authResponse, supabase, user, ...billing };
}

export async function GET() {
  if (!websiteServiceAvailable()) {
    return NextResponse.json({ website: null, persisted: false });
  }
  try {
    const { user, isOwner, authResponse } = await owner();
    if (!isOwner) {
      return NextResponse.json({ error: "Only the account owner can manage the website" }, { status: 403 });
    }
    const website = await loadOwnedWebsite(user.id);
    const admin = websiteAdmin();
    const { data: profile } = await admin
      .from("host_profiles")
      .select("username, is_published, public_site_mode")
      .eq("id", user.id)
      .maybeSingle();
    const response = NextResponse.json({
      website: website
        ? {
            id: website.id,
            slug: website.slug,
            status: website.status,
            theme: website.theme,
            updatedAt: website.updated_at,
            publishedAt: website.published_at,
            createdAt: website.created_at,
            document: normalizeDocument(website.draft_document),
          }
        : null,
      publicSiteMode: profile?.public_site_mode ?? "booking",
      hostPublished: profile?.is_published === true,
      username: profile?.username ?? null,
      url: profile?.username ? getBookingSiteUrl(profile.username) : null,
    });
    for (const cookie of authResponse.cookies.getAll()) response.cookies.set(cookie);
    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  if (!websiteServiceAvailable()) {
    return NextResponse.json({ error: "Publishing is unavailable" }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  const record = body && typeof body === "object" ? (body as { action?: string; mode?: string }) : {};
  const action = record.action === "unpublish" || record.action === "mode" ? record.action : "publish";

  try {
    const { user, isOwner, authResponse } = await owner();
    if (!isOwner) {
      return NextResponse.json({ error: "Only the account owner can publish" }, { status: 403 });
    }

    if (action === "unpublish") {
      const website = await unpublishOwnedWebsite(user.id);
      const response = NextResponse.json({ website });
      for (const cookie of authResponse.cookies.getAll()) response.cookies.set(cookie);
      return response;
    }

    if (action === "mode") {
      const mode = record.mode === "website" ? "website" : "booking";
      if (mode === "website") {
        const website = await loadOwnedWebsite(user.id);
        if (!website || website.status !== "published") {
          return NextResponse.json(
            { error: "Publish the full website before showing it to guests" },
            { status: 400 }
          );
        }
      }
      const admin = websiteAdmin();
      const { error } = await admin
        .from("host_profiles")
        .update({ public_site_mode: mode })
        .eq("id", user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const response = NextResponse.json({ publicSiteMode: mode });
      for (const cookie of authResponse.cookies.getAll()) response.cookies.set(cookie);
      return response;
    }

    const result = await publishOwnedWebsite(user.id, user.email ?? null);
    const response = NextResponse.json({
      website: result.website,
      username: result.username,
      url: getBookingSiteUrl(result.username),
      pro: result.pro,
    });
    for (const cookie of authResponse.cookies.getAll()) response.cookies.set(cookie);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update website";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
