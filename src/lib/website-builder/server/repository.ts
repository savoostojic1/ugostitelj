import "server-only";
import { stripLocalImages } from "@/lib/website-builder/local-images";

import { hasProAccess } from "@/lib/subscriptions/access";
import { loadHostSubscription } from "@/lib/subscriptions/resolve-host-subscription";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { suggestPropertySlug } from "@/lib/public/slug";
import { isReservedWebsiteSlug } from "@/lib/website-builder/paths";
import { normalizeDocument } from "@/lib/website-builder/document-ops";
import { cleanEmail, cleanPhone, documentTooLarge } from "@/lib/website-builder/sanitize";
import type { WebsiteDocument } from "@/lib/website-builder/types";

export function websiteServiceAvailable(): boolean {
  return hasServiceRoleKey();
}

export function websiteAdmin() {
  return createServiceClient();
}

export async function loadOwnedWebsite(userId: string) {
  const admin = websiteAdmin();
  const { data, error } = await admin
    .from("websites")
    .select("id, user_id, slug, status, theme, draft_document, published_document, published_at, updated_at, created_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveOwnedDraft(userId: string, document: WebsiteDocument) {
  if (documentTooLarge(document)) {
    throw new Error("Website is too large to save");
  }
  const admin = websiteAdmin();
  const { data, error } = await admin
    .from("websites")
    .update({
      draft_document: document,
      theme: document.theme,
    })
    .eq("user_id", userId)
    .select("id, updated_at, status, slug")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function uniquePropertySlug(
  admin: ReturnType<typeof websiteAdmin>,
  name: string
): Promise<string> {
  const base = suggestPropertySlug(name);
  let candidate = isReservedWebsiteSlug(base) ? `${base}-stay` : base;
  for (let n = 2; n < 40; n += 1) {
    const { data } = await admin
      .from("properties")
      .select("id")
      .ilike("slug", candidate)
      .maybeSingle();
    if (!data) return candidate.slice(0, 50);
    candidate = `${base.slice(0, 40)}-${n}`;
  }
  return `${base.slice(0, 32)}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function publishOwnedWebsite(userId: string, email: string | null) {
  const admin = websiteAdmin();
  const website = await loadOwnedWebsite(userId);
  if (!website) throw new Error("Save the website to your account before publishing");

  // Photos still waiting in the host's browser cannot be shown to guests.
  const document = stripLocalImages(normalizeDocument(website.draft_document));
  if (!document.profile.name.trim()) {
    throw new Error("Add a property name before publishing");
  }
  if (documentTooLarge(document)) throw new Error("Website is too large to publish");

  const subscription = await loadHostSubscription(admin, userId);
  const pro = hasProAccess(subscription);
  if (!pro) {
    document.design.hideBranding = false;
    document.pages = document.pages.map((page) => ({
      ...page,
      seo: { ...page.seo, noindex: false },
    }));
  }

  const { data: profile, error: profileError } = await admin
    .from("host_profiles")
    .select("id, username, business_name, description, contact_email, contact_phone, location, logo_url")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);

  let username = profile?.username as string | undefined;
  if (!profile) {
    username = website.slug;
    const { error } = await admin.from("host_profiles").insert({
      id: userId,
      username,
      business_name: document.profile.name,
      description: document.profile.shortDescription || null,
      contact_email: cleanEmail(document.profile.contactEmail) || email,
      contact_phone: cleanPhone(document.profile.contactPhone) || null,
      location: document.profile.location || null,
      logo_url: document.profile.logoUrl || null,
      is_published: true,
      public_site_mode: "website",
    });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin
      .from("host_profiles")
      .update({
        is_published: true,
        public_site_mode: "website",
        business_name: profile.business_name || document.profile.name,
        description: profile.description || document.profile.shortDescription || null,
        contact_email: profile.contact_email || cleanEmail(document.profile.contactEmail) || email,
        contact_phone: profile.contact_phone || cleanPhone(document.profile.contactPhone) || null,
        location: profile.location || document.profile.location || null,
        logo_url: profile.logo_url || document.profile.logoUrl || null,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    username = profile.username;
  }

  const propertyIds = document.accommodations
    .map((stay) => stay.propertyId)
    .filter((id): id is string => Boolean(id));

  if (propertyIds.length) {
    const { data: properties, error } = await admin
      .from("properties")
      .select("id, name, slug, user_id")
      .in("id", propertyIds)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    for (const property of properties ?? []) {
      const slug = property.slug || (await uniquePropertySlug(admin, property.name));
      const { error: updateError } = await admin
        .from("properties")
        .update({ is_public: true, slug })
        .eq("id", property.id)
        .eq("user_id", userId);
      if (updateError) throw new Error(updateError.message);
    }
  }

  const publishedAt = new Date().toISOString();
  const patch = {
    status: "published" as const,
    theme: document.theme,
    draft_document: document,
    published_document: document,
    published_at: publishedAt,
    slug: username || website.slug,
  };
  let savedResult = await admin
    .from("websites")
    .update(patch)
    .eq("id", website.id)
    .eq("user_id", userId)
    .select("id, slug, status, published_at, updated_at")
    .single();
  if (savedResult.error && /slug/i.test(savedResult.error.message)) {
    savedResult = await admin
      .from("websites")
      .update({ ...patch, slug: website.slug })
      .eq("id", website.id)
      .eq("user_id", userId)
      .select("id, slug, status, published_at, updated_at")
      .single();
  }
  if (savedResult.error || !savedResult.data) {
    throw new Error(savedResult.error?.message ?? "Could not publish");
  }
  return { website: savedResult.data, username: username || website.slug, pro };
}

export async function unpublishOwnedWebsite(userId: string) {
  const admin = websiteAdmin();
  const { data, error } = await admin
    .from("websites")
    .update({ status: "unpublished" })
    .eq("user_id", userId)
    .select("id, status, published_at, updated_at")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
