"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { WEBSITE_BUILDER_PATH, WEBSITE_MANAGEMENT_PATH } from "@/lib/website-builder/limits";
import { getBookingSiteUrl } from "@/lib/public/booking-site-url";
import { WebsiteEmptyState } from "@/components/website-builder/website-empty-state";

interface WebsiteState {
  website: {
    id: string;
    slug: string;
    status: string;
    theme: string;
    updatedAt: string;
    publishedAt: string | null;
    createdAt: string;
    document: {
      profile: { name: string };
      accommodations: { id: string; name: string; propertyId: string | null }[];
      pages: {
        id: string;
        title: string;
        slug: string;
        enabled: boolean;
        isHome?: boolean;
        seo?: { title?: string; description?: string };
      }[];
    };
  } | null;
  properties?: { id: string; name: string; isPublic: boolean }[];
  publicSiteMode: "booking" | "website";
  hostPublished: boolean;
  username: string | null;
  url: string | null;
}

export default function WebsiteManagementPage() {
  const [state, setState] = useState<WebsiteState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState("Overview");

  async function load() {
    const response = await fetch("/api/websites");
    if (response.status === 401) return;
    const json = await response.json();
    setState(json);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const claim = new URLSearchParams(window.location.search).get("claim");
      if (claim === "1") {
        const response = await fetch("/api/website-builder/claim", { method: "POST" });
        const json = await response.json();
        if (!response.ok && json.error !== "not_found") {
          setMessage(
            json.error === "account_has_website"
              ? "Your account already has a website. The anonymous draft was kept so you can replace the draft explicitly from the builder."
              : (json.error ?? "Could not claim the website")
          );
        }
        window.history.replaceState(null, "", WEBSITE_MANAGEMENT_PATH);
      }
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function act(action: "publish" | "unpublish" | "mode", mode?: "booking" | "website") {
    const response = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, mode }),
    });
    const json = await response.json();
    if (!response.ok) {
      setMessage(json.error ?? "Could not update the website");
      return;
    }
    setMessage(action === "publish" && json.url ? `Published. Guests can open ${json.url}` : "Updated");
    await load();
  }

  if (!state) return <p className="text-sm text-zinc-400">Loading website…</p>;
  const website = state.website;
  const publicUrl = state.url ?? (state.username ? getBookingSiteUrl(state.username) : null);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Website"
        title={website ? "Website management" : "Your website"}
        description={
          website
            ? "Edit the full website, choose what guests see, and publish when you are ready."
            : "A website of your own where guests can discover your place and book with you directly."
        }
        actions={
          website ? (
            <Button asChild>
              <Link href={`${WEBSITE_BUILDER_PATH}?mode=editor`}>Edit website</Link>
            </Button>
          ) : null
        }
      />
      {message ? <p className="text-sm text-zinc-300" role="status">{message}</p> : null}
      {!website ? (
        <WebsiteEmptyState />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Stat label="Address" value={publicUrl ?? "Set a username on the booking site"} />
            <Stat label="Publishing" value={website.status} />
            <Stat label="Last saved" value={formatWhen(website.updatedAt)} />
            <Stat label="Last published" value={website.publishedAt ? formatWhen(website.publishedAt) : "Not published"} />
          </div>
          <StayAlert properties={state.properties ?? []} />
          <div className="flex flex-wrap gap-2" role="tablist">
            {["Overview", "Pages", "Accommodations", "Design", "SEO", "Domain", "Publishing", "Settings"].map((item) => (
              <button key={item} type="button" role="tab" aria-selected={tab === item} className={`rounded-full px-3 py-1 text-sm ${tab === item ? "bg-white text-black" : "text-zinc-400"}`} onClick={() => setTab(item)}>
                {item}
              </button>
            ))}
          </div>
          {tab === "Overview" ? (
            <div className="space-y-3 text-sm text-zinc-300">
              <p>{website.document.profile.name || "Untitled stay"} · {website.theme}</p>
              <p>{website.document.pages.filter((page) => page.enabled).length} pages visible to guests after publishing.</p>
              {publicUrl && website.status === "published" && state.publicSiteMode === "website" ? (
                <a className="text-violet-300" href={publicUrl}>Open public website</a>
              ) : (
                <p>The public address still shows the booking site until you publish and select Full website.</p>
              )}
              <Link className="block text-violet-300" href={`${WEBSITE_BUILDER_PATH}?mode=editor`}>Preview and edit the draft</Link>
            </div>
          ) : null}
          {tab === "Pages" ? (
            <ul className="space-y-2 text-sm">
              {website.document.pages.map((page) => (
                <li key={page.id}>{page.title}{page.enabled ? "" : " — hidden"}</li>
              ))}
            </ul>
          ) : null}
          {tab === "Accommodations" ? <StayList properties={state.properties ?? []} /> : null}
          {tab === "Design" ? <p className="text-sm text-zinc-400">Theme: {website.theme}. Open the editor to change layout, palette and motion.</p> : null}
          {tab === "SEO" ? (
            <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-zinc-300">
              <p>
                Each published page gets its own title, description, canonical URL, Open Graph image and lodging structured data.
                Empty fields use the property name, location and introduction. Drafts and unpublished sites are not indexed.
              </p>
              <ul className="space-y-3">
                {website.document.pages.filter((page) => page.enabled).map((page) => (
                  <li key={page.id} className="rounded-xl border border-white/10 p-4">
                    <p className="font-medium text-white">{page.title}</p>
                    <p className="mt-1 text-zinc-400">{page.isHome ? "/" : `/${page.slug}`}</p>
                    <p className="mt-2">{page.seo?.title || "Search title follows the property name and location."}</p>
                    <p className="mt-1 text-zinc-400">{page.seo?.description || "Description follows your introduction until you write one in the editor."}</p>
                  </li>
                ))}
              </ul>
              <Link className="text-violet-300" href={WEBSITE_BUILDER_PATH}>Edit titles and descriptions</Link>
            </div>
          ) : null}
          {tab === "Domain" ? (
            <div className="max-w-xl text-sm leading-relaxed text-zinc-300">
              <p>Your site is served at {publicUrl ?? "your Hostvia subdomain"}.</p>
              <p className="mt-3">Custom domains are a Pro capability and are not connected yet. A later release has to verify ownership, show DNS records, issue SSL and only then serve traffic. Nothing here pretends a custom domain is live.</p>
            </div>
          ) : null}
          {tab === "Publishing" ? (
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => void act("publish")}>Publish</Button>
              <Button type="button" variant="outline" onClick={() => void act("unpublish")}>Unpublish</Button>
              <p className="w-full text-sm text-zinc-400">Unpublishing keeps the draft, the published snapshot and your properties. Guests stop seeing the full website. Reservations are not changed.</p>
            </div>
          ) : null}
          {tab === "Settings" ? (
            <div className="space-y-3 text-sm">
              <p>Public experience</p>
              <div className="flex gap-2">
                <Button type="button" variant={state.publicSiteMode === "booking" ? "default" : "outline"} onClick={() => void act("mode", "booking")}>Booking website</Button>
                <Button type="button" variant={state.publicSiteMode === "website" ? "default" : "outline"} onClick={() => void act("mode", "website")}>Full website</Button>
              </div>
              <p className="max-w-xl text-zinc-400">Both experiences stay stored. Guests see only the one you select, at the same Hostvia address.</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/** The website shows the host's public Hostvia properties, exactly like the booking site. */
function StayAlert({ properties }: { properties: { id: string; name: string; isPublic: boolean }[] }) {
  if (properties.some((property) => property.isPublic)) return null;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4 sm:flex-row sm:items-center" role="alert">
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-amber-100">Your website has no stays yet</p>
        <p className="mt-1 text-amber-100/70">
          {properties.length
            ? "Your properties are hidden from your booking site. Make them public and they appear on the website with their price, calendar and availability."
            : "Add your accommodation in Properties. It appears on the website automatically with its price, calendar and availability."}
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard/properties">Open Properties</Link>
      </Button>
    </div>
  );
}

function StayList({ properties }: { properties: { id: string; name: string; isPublic: boolean }[] }) {
  const shown = properties.filter((property) => property.isPublic);
  const hidden = properties.filter((property) => !property.isPublic);
  return (
    <div className="max-w-xl space-y-3 text-sm text-zinc-300">
      <p className="text-zinc-400">
        Your website shows the same stays as your booking site. Photos, prices, guests and availability come from each property.
      </p>
      {shown.length ? (
        <ul className="space-y-1">
          {shown.map((property) => (
            <li key={property.id}>{property.name}</li>
          ))}
        </ul>
      ) : null}
      {hidden.length ? (
        <p className="text-zinc-500">Hidden from guests: {hidden.map((property) => property.name).join(", ")}</p>
      ) : null}
      <Link className="text-violet-300" href="/dashboard/properties">Manage properties</Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  );
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
