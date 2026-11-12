import { NextRequest, NextResponse } from "next/server";
import { newDraftToken } from "@/lib/website-builder/draft-store";
import { normalizeDocument } from "@/lib/website-builder/document-ops";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { documentTooLarge } from "@/lib/website-builder/sanitize";
import {
  readDraftToken,
  writeDraftToken,
} from "@/lib/website-builder/server/cookies";
import {
  loadOwnedWebsite,
  saveOwnedDraft,
  websiteAdmin,
  websiteServiceAvailable,
} from "@/lib/website-builder/server/repository";
import { clientIpFromHeaders } from "@/lib/security/rate-limit";
import { consumePublicRateLimit } from "@/lib/security/consume-rate-limit";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

function draftExpiry(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  const cap = created + WEBSITE_LIMITS.anonymousMaxAgeDays * 24 * 60 * 60 * 1000;
  const extend = Date.now() + WEBSITE_LIMITS.anonymousTtlDays * 24 * 60 * 60 * 1000;
  return new Date(Math.min(cap, extend)).toISOString();
}

async function currentUserId(): Promise<string | null> {
  const response = new NextResponse();
  const supabase = await createRouteHandlerClient(response);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

const PROPERTY_COLUMNS =
  "id, slug, name, short_description, description, address, image_url, gallery_urls, capacity, amenities, starting_price, currency_code, is_public";

async function ownedProperties(userId: string) {
  const { data } = await websiteAdmin()
    .from("properties")
    .select(PROPERTY_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function GET(request: NextRequest) {
  const userId = await currentUserId();
  const authenticated = Boolean(userId);
  if (userId && websiteServiceAvailable()) {
    const website = await loadOwnedWebsite(userId);
    if (website) {
      const document = normalizeDocument(website.draft_document);
      const properties = await ownedProperties(userId);
      return NextResponse.json({
        authenticated,
        source: "account",
        websiteId: website.id,
        status: website.status,
        slug: website.slug,
        updatedAt: website.updated_at,
        publishedAt: website.published_at,
        persisted: true,
        document,
        properties,
      });
    }
  }

  // Signed-in hosts without a website yet can still connect their properties while designing.
  const properties = userId && websiteServiceAvailable() ? await ownedProperties(userId) : [];

  const token = readDraftToken(request);
  if (!token || !websiteServiceAvailable()) {
    return NextResponse.json({ authenticated, source: "local", document: null, persisted: false, properties });
  }

  const admin = websiteAdmin();
  const { data, error } = await admin
    .from("website_projects")
    .select("id, document, updated_at, claimed_at, expires_at")
    .eq("draft_token", token)
    .maybeSingle();
  if (error) {
    console.error("[website-builder/draft GET]", error.message);
    return NextResponse.json({ error: "Could not load draft" }, { status: 500 });
  }
  if (!data || data.claimed_at || new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ authenticated, source: "local", document: null, persisted: false, properties });
  }
  return NextResponse.json({
    authenticated,
    properties,
    source: "project",
    id: data.id,
    updatedAt: data.updated_at,
    persisted: true,
    document: normalizeDocument(data.document),
  });
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const record = body && typeof body === "object" ? (body as { document?: unknown }) : {};
  const document = normalizeDocument(record.document);
  if (documentTooLarge(document)) {
    return NextResponse.json({ error: "Website is too large to save" }, { status: 413 });
  }

  const userId = await currentUserId();
  if (userId && websiteServiceAvailable()) {
    const existing = await loadOwnedWebsite(userId);
    if (existing) {
      try {
        const saved = await saveOwnedDraft(userId, document);
        return NextResponse.json({
          source: "account",
          websiteId: saved?.id ?? existing.id,
          updatedAt: saved?.updated_at,
          persisted: true,
          document,
        });
      } catch (error) {
        console.error("[website-builder/draft account]", error);
        return NextResponse.json({ error: "Could not save website" }, { status: 500 });
      }
    }
  }

  if (!websiteServiceAvailable()) {
    return NextResponse.json({ source: "local", persisted: false, document });
  }

  const ip = clientIpFromHeaders(request.headers);
  const limit = await consumePublicRateLimit(
    "website_draft_write",
    ip,
    WEBSITE_LIMITS.draftWritesPer10Min,
    10 * 60
  );
  if (limit === "deny") {
    return NextResponse.json({ error: "Too many saves. Try again shortly." }, { status: 429 });
  }

  const admin = websiteAdmin();
  const token = readDraftToken(request);
  if (token) {
    const { data: existing, error } = await admin
      .from("website_projects")
      .select("id, claimed_at, created_at")
      .eq("draft_token", token)
      .maybeSingle();
    if (error) {
      console.error("[website-builder/draft lookup]", error.message);
      return NextResponse.json({ error: "Could not save draft" }, { status: 500 });
    }
    if (existing && !existing.claimed_at) {
      const { data, error: updateError } = await admin
        .from("website_projects")
        .update({
          document,
          expires_at: draftExpiry(existing.created_at),
        })
        .eq("id", existing.id)
        .select("id, updated_at")
        .single();
      if (updateError) {
        console.error("[website-builder/draft update]", updateError.message);
        return NextResponse.json({ error: "Could not save draft" }, { status: 500 });
      }
      return NextResponse.json({
        source: "project",
        id: data.id,
        updatedAt: data.updated_at,
        persisted: true,
        document,
      });
    }
  }

  const createLimit = await consumePublicRateLimit(
    "website_draft_create",
    ip,
    WEBSITE_LIMITS.draftCreatesPerHour,
    60 * 60
  );
  if (createLimit === "deny") {
    return NextResponse.json({ error: "Too many new websites from this network." }, { status: 429 });
  }

  const createdToken = newDraftToken();
  const { data, error } = await admin
    .from("website_projects")
    .insert({ draft_token: createdToken, document })
    .select("id, updated_at")
    .single();
  if (error || !data) {
    console.error("[website-builder/draft insert]", error?.message);
    return NextResponse.json({ error: "Could not save draft" }, { status: 500 });
  }
  const response = NextResponse.json({
    source: "project",
    id: data.id,
    updatedAt: data.updated_at,
    persisted: true,
    document,
  });
  writeDraftToken(response, createdToken);
  return response;
}
