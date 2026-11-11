import type { Metadata } from "next";
import { getBookingSiteUrl } from "@/lib/public/booking-site-url";
import { SITE_URL } from "@/lib/seo/site";
import { pagePath } from "@/lib/website-builder/paths";
import type { PublicStay, PublicWebsiteModel, WebsitePage } from "@/lib/website-builder/types";

export function websiteOrigin(username: string): string {
  return getBookingSiteUrl(username) ?? `${SITE_URL}/host/${username}`;
}

export function canonicalFor(username: string, page: Pick<WebsitePage, "slug" | "isHome" | "type">): string {
  const origin = websiteOrigin(username);
  const path = pagePath(page);
  return path === "/" ? origin : `${origin}${path}`;
}

export function indexableRobots(page: WebsitePage, pro: boolean): { index: boolean; follow: boolean } {
  if (pro && page.seo.noindex) return { index: false, follow: false };
  return { index: true, follow: true };
}

export function resolvedSeoTitle(model: PublicWebsiteModel): string {
  const page = model.page;
  const name = model.profile.name || page.title || "Vacation rental";
  const place = model.profile.location;
  const custom = page.seo.title.trim();
  if (custom && custom !== page.title) return custom.slice(0, 70);
  if (page.isHome) return (place ? `${name} in ${place}` : `${name} · Vacation rental`).slice(0, 70);
  return `${page.title} · ${name}`.slice(0, 70);
}

export function resolvedSeoDescription(model: PublicWebsiteModel): string {
  const page = model.page;
  const name = model.profile.name || "this vacation rental";
  const place = model.profile.location;
  if (page.seo.description.trim()) return page.seo.description.trim().slice(0, 160);
  const written =
    model.profile.shortDescription ||
    page.sections.find((section) => section.settings.body)?.settings.body ||
    "";
  if (written.trim()) return written.trim().slice(0, 160);
  const where = place ? ` in ${place}` : "";
  return `Stay at ${name}${where}. See the rooms, nightly price and availability, then send a booking inquiry to the host.`.slice(0, 160);
}

export function buildWebsiteMetadata(model: PublicWebsiteModel): Metadata {
  const page = model.page;
  const title = resolvedSeoTitle(model);
  const description = resolvedSeoDescription(model);
  const image =
    page.seo.ogImage ||
    page.sections.find((section) => section.settings.imageUrl)?.settings.imageUrl ||
    model.gallery[0]?.url ||
    model.stays[0]?.photos[0]?.url ||
    "";
  const canonical = canonicalFor(model.username, page);
  const robots = model.preview
    ? { index: false, follow: false }
    : indexableRobots(page, model.pro);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      title: page.seo.ogTitle || title,
      description: page.seo.ogDescription || description,
      url: canonical,
      type: "website",
      images: image
        ? [{ url: image, alt: page.seo.ogTitle || title, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: page.seo.ogTitle || title,
      description: page.seo.ogDescription || description,
      images: image ? [image] : undefined,
    },
  };
}

export function websiteSitemapPaths(pages: WebsitePage[]): string[] {
  return pages
    .filter((page) => page.enabled && !(page.seo.noindex))
    .map((page) => pagePath(page));
}

export function lodgingJsonLd(model: PublicWebsiteModel): Record<string, unknown> {
  const photos = [
    ...model.gallery.map((image) => image.url),
    ...model.stays.flatMap((stay) => stay.photos.map((image) => image.url)),
  ].filter(Boolean);
  const offers = model.stays
    .filter((stay) => stay.pricePerNight && stay.currencyCode)
    .map((stay) => ({
      "@type": "Offer",
      name: stay.name,
      price: stay.pricePerNight,
      priceCurrency: stay.currencyCode,
      url: `${websiteOrigin(model.username)}${stay.href === "/" ? "" : stay.href}`,
      availability: "https://schema.org/LimitedAvailability",
    }));
  const places = model.stays.map((stay) => ({
    "@type": "Accommodation",
    name: stay.name,
    description: stay.summary || stay.description || undefined,
    occupancy: stay.capacity ? { "@type": "QuantitativeValue", value: stay.capacity } : undefined,
    image: stay.photos[0]?.url || undefined,
    amenityFeature: stay.amenities.slice(0, 12).map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  }));
  return {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "VacationRental"],
    name: model.profile.name || model.page.title,
    description: model.profile.shortDescription || resolvedSeoDescription(model),
    url: canonicalFor(model.username, model.page),
    image: photos.slice(0, 8),
    telephone: model.profile.contactPhone || undefined,
    email: model.profile.contactEmail || undefined,
    address: model.profile.location
      ? { "@type": "PostalAddress", addressLocality: model.profile.location }
      : undefined,
    containsPlace: places.length ? places : undefined,
    makesOffer: offers.length ? offers : undefined,
  };
}

export function breadcrumbJsonLd(model: PublicWebsiteModel): Record<string, unknown> {
  const origin = websiteOrigin(model.username);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: model.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.path === "/" ? origin : `${origin}${crumb.path}`,
    })),
  };
}

export function faqJsonLdForPage(model: PublicWebsiteModel): Record<string, unknown> | null {
  const items = model.page.sections
    .filter((section) => section.visible && section.type === "faq")
    .flatMap((section) => section.settings.items)
    .filter((item) => item.title && item.body);
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.title,
      acceptedAnswer: { "@type": "Answer", text: item.body },
    })),
  };
}

export function stayPriceLabel(stay: Pick<PublicStay, "pricePerNight" | "currencyCode">): string | null {
  if (!stay.pricePerNight || stay.pricePerNight <= 0) return null;
  return stay.currencyCode;
}
