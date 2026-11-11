import { NextResponse } from "next/server";
import { defaultPropertyCurrency } from "@/lib/currency/currencies";
import {
  findEquivalentProperties,
  validateImportDecisions,
  type ImportDecision,
} from "@/lib/website-builder/property-match";
import { normalizeDocument } from "@/lib/website-builder/document-ops";
import {
  loadOwnedWebsite,
  saveOwnedDraft,
  websiteServiceAvailable,
} from "@/lib/website-builder/server/repository";
import { canAddProperty } from "@/lib/subscriptions/access";
import {
  loadHostSubscription,
  resolveBillingHostId,
} from "@/lib/subscriptions/resolve-host-subscription";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { requireUser } from "@/lib/supabase/require-user";

function isDecision(value: unknown): value is ImportDecision {
  if (!value || typeof value !== "object") return false;
  const record = value as { accommodationId?: unknown; action?: unknown };
  if (typeof record.accommodationId !== "string") return false;
  return record.action === "link" || record.action === "create" || record.action === "skip";
}

export async function GET() {
  const authResponse = new NextResponse();
  const supabase = await createRouteHandlerClient(authResponse);
  try {
    const user = await requireUser(supabase);
    const { isOwner } = await resolveBillingHostId(supabase, user.id);
    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!websiteServiceAvailable()) {
      return NextResponse.json({ properties: [], accommodations: [] });
    }
    const website = await loadOwnedWebsite(user.id);
    const document = normalizeDocument(website?.draft_document ?? {});
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, name, address, slug, currency_code, starting_price")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const owned = (properties ?? []).map((property) => ({
      id: property.id as string,
      name: property.name as string,
      address: (property.address as string | null) ?? null,
      slug: (property.slug as string | null) ?? null,
      currencyCode: (property.currency_code as string | null) ?? "EUR",
      startingPrice: property.starting_price as number | null,
    }));
    return NextResponse.json({
      properties: owned,
      accommodations: document.accommodations.map((stay) => ({
        id: stay.id,
        name: stay.name,
        kind: stay.kind,
        propertyId: stay.propertyId,
        matches: findEquivalentProperties(stay.name, owned),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const authResponse = new NextResponse();
  const supabase = await createRouteHandlerClient(authResponse);
  try {
    const user = await requireUser(supabase);
    const { hostId, isOwner } = await resolveBillingHostId(supabase, user.id);
    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!websiteServiceAvailable()) {
      return NextResponse.json({ error: "Import unavailable" }, { status: 503 });
    }
    const website = await loadOwnedWebsite(user.id);
    if (!website) return NextResponse.json({ error: "Claim the website first" }, { status: 404 });

    const body = await request.json().catch(() => null);
    const decisions = Array.isArray((body as { decisions?: unknown })?.decisions)
      ? ((body as { decisions: unknown[] }).decisions.filter(isDecision) as ImportDecision[])
      : [];
    const document = normalizeDocument(website.draft_document);
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, name")
      .eq("user_id", hostId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const owned = (properties ?? []).map((property) => ({
      id: property.id as string,
      name: property.name as string,
    }));
    const valid = validateImportDecisions({
      decisions,
      accommodations: document.accommodations.map((stay) => ({
        id: stay.id,
        name: stay.name,
        propertyId: stay.propertyId,
      })),
      properties: owned,
    });
    if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 409 });

    const subscription = await loadHostSubscription(supabase, hostId);
    const links = new Map<string, string>();
    for (const decision of decisions) {
      if (decision.action === "skip") continue;
      if (decision.action === "link") {
        links.set(decision.accommodationId, decision.propertyId);
        continue;
      }
      const stay = document.accommodations.find((item) => item.id === decision.accommodationId);
      if (!stay) continue;
      if (stay.propertyId && owned.some((property) => property.id === stay.propertyId)) {
        links.set(stay.id, stay.propertyId);
        continue;
      }
      const { count } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", hostId);
      if (!canAddProperty(count ?? 0, subscription)) {
        return NextResponse.json(
          {
            error: "Property limit reached",
            upgradeRequired: true,
            linked: Object.fromEntries(links),
          },
          { status: 402 }
        );
      }
      const { data: created, error: insertError } = await supabase
        .from("properties")
        .insert({
          user_id: hostId,
          name: stay.name,
          address: stay.location || null,
          short_description: stay.summary || null,
          description: stay.description || null,
          capacity: stay.capacity,
          amenities: stay.amenities,
          starting_price: stay.pricePerNight,
          currency_code: stay.currencyCode || defaultPropertyCurrency(),
          image_url: stay.photos[0]?.url || null,
          gallery_urls: stay.photos.map((photo) => photo.url),
          is_public: false,
        })
        .select("id, name")
        .single();
      if (insertError || !created) {
        return NextResponse.json({ error: insertError?.message ?? "Could not create property" }, { status: 500 });
      }
      owned.push({ id: created.id as string, name: created.name as string });
      links.set(stay.id, created.id as string);
    }

    const next = normalizeDocument({
      ...document,
      accommodations: document.accommodations.map((stay) => {
        const propertyId = links.get(stay.id);
        return propertyId ? { ...stay, propertyId } : stay;
      }),
    });
    await saveOwnedDraft(user.id, next);
    const response = NextResponse.json({
      document: next,
      linked: Object.fromEntries(links),
    });
    for (const cookie of authResponse.cookies.getAll()) response.cookies.set(cookie);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
