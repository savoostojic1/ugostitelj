"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  BedDouble,
  Check,
  Home,
  Image as ImageIcon,
  Info,
  MapPin,
  MessageSquareQuote,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { Field, Label, Segmented, Select, SectionTitle, Toggle } from "@/components/website-builder/ui";
import { Dropzone, PhotoGrid, StarterPhotosButton, useUploader } from "@/components/website-builder/photos";
import { StayConnectionNotice } from "@/components/website-builder/stay-connection";
import type { WebsiteStudioApi } from "@/components/website-builder/use-website-studio";
import {
  addGalleryImages,
  removeGalleryImage,
  setCoverImage,
  setGallery,
  switchTheme,
  updateAccommodation,
  updatePage,
  withProfile,
} from "@/lib/website-builder/document-ops";
import { KIND_LABELS } from "@/lib/website-builder/defaults";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { WEBSITE_THEME_META, themeMeta, paletteFor } from "@/lib/website-builder/themes";
import { ACCOMMODATION_KINDS, WEBSITE_LANGUAGES, type WebsiteDocument, type WebsitePageType } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";

export interface StepProps {
  studio: WebsiteStudioApi;
  document: WebsiteDocument;
}

/* ------------------------------------------------------------------ */
/* 1. Style                                                           */
/* ------------------------------------------------------------------ */

export function StyleStep({ studio, document }: StepProps) {
  return (
    <div>
      <SectionTitle
        eyebrow="Design"
        title="Choose how your place should feel."
        description="Five art-directed websites, each with its own type, composition and motion. You can switch at any time without losing your content."
      />
      <div className="grid gap-3">
        {WEBSITE_THEME_META.map((theme, index) => {
          const selected = document.theme === theme.id;
          const palette = theme.palettes[0].tokens;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => studio.change(switchTheme(document, theme.id))}
              aria-pressed={selected}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-300",
                selected
                  ? "border-violet-400/60 bg-violet-500/[0.08] shadow-[0_0_0_4px_rgba(139,92,246,0.12)]"
                  : "border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className="relative grid h-[68px] w-[68px] shrink-0 place-items-center overflow-hidden rounded-xl"
                  style={{ background: palette.bg, color: palette.ink }}
                  aria-hidden
                >
                  <span className="text-[30px] leading-none" style={{ fontFamily: `var(--font-wb-${theme.id === "minimal" ? "minimal-sans" : `${theme.id}-serif`})`, fontStyle: theme.id === "escape" || theme.id === "coastal" ? "italic" : "normal", fontWeight: theme.id === "minimal" ? 600 : 400 }}>
                    Aa
                  </span>
                  <span className="absolute bottom-1.5 left-1.5 flex gap-1">
                    {theme.swatch.map((color) => (
                      <span key={color} className="h-2 w-2 rounded-full ring-1 ring-black/10" style={{ background: color }} />
                    ))}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium tabular-nums text-zinc-500">0{index + 1}</span>
                    <span className="text-[16px] font-semibold text-white">{theme.name}</span>
                    <span className="truncate text-[12.5px] text-zinc-400">· {theme.tagline}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-zinc-400">{theme.description}</p>
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-zinc-500">
                    <span>{theme.typography.display}</span>
                    <span className="text-zinc-700">/</span>
                    <span>{theme.suitedFor}</span>
                  </p>
                </div>
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
                    selected ? "border-violet-400 bg-violet-500 text-white" : "border-white/15 text-transparent"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[12.5px] text-zinc-500">
        Want to scroll a finished example?{" "}
        <Link href={`/website-builder/demo/${document.theme}`} target="_blank" className="text-violet-300 underline-offset-4 hover:underline">
          Open the {themeMeta(document.theme).name} demo
        </Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Property                                                        */
/* ------------------------------------------------------------------ */

const TYPE_SUGGESTIONS = ["Villa", "Apartment", "Holiday home", "Cabin", "Boutique hotel", "Guesthouse", "Retreat", "Bungalow"];

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português", hr: "Hrvatski", sr: "Srpski", bs: "Bosanski",
  sl: "Slovenščina", el: "Ελληνικά", nl: "Nederlands", pl: "Polski", cs: "Čeština", hu: "Magyar", tr: "Türkçe", sv: "Svenska", no: "Norsk",
  da: "Dansk", fi: "Suomi", ro: "Română", ru: "Русский", uk: "Українська", ar: "العربية", he: "עברית", ja: "日本語", zh: "中文",
};

export function PropertyStep({ studio, document }: StepProps) {
  const p = document.profile;
  const set = (patch: Partial<WebsiteDocument["profile"]>, key: string) => studio.change(withProfile(document, patch), { coalesce: `profile.${key}` });
  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Your place"
        title="Tell guests where they're going."
        description="A name, a place and one good sentence. The preview fills in as you type."
      />
      <Field label="Property name" value={p.name} onChange={(name) => set({ name }, "name")} placeholder="e.g. Villa Serena" maxLength={WEBSITE_LIMITS.title} />
      <div>
        <Field label="What kind of place is it?" value={p.propertyType} onChange={(propertyType) => set({ propertyType }, "type")} placeholder="e.g. Private villa" maxLength={80} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TYPE_SUGGESTIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => studio.change(withProfile(document, { propertyType: type }))}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12px] transition",
                p.propertyType === type ? "border-violet-400/60 bg-violet-500/15 text-violet-100" : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <Field label="Location" value={p.location} onChange={(location) => set({ location }, "location")} placeholder="e.g. Hvar, Croatia" maxLength={160} hint={<MapPin className="h-3 w-3" />} />
      <Field
        label="One sentence about your place"
        value={p.shortDescription}
        onChange={(shortDescription) => set({ shortDescription }, "desc")}
        multiline
        rows={3}
        maxLength={WEBSITE_LIMITS.shortText}
        placeholder="A stone house above the sea, kept for slow mornings and long dinners."
      />
      <p className="-mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-zinc-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Describe a feeling or a moment, not a list of features. It becomes your homepage introduction and search description.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact email" type="email" value={p.contactEmail} onChange={(contactEmail) => set({ contactEmail }, "email")} placeholder="you@example.com" />
        <Field label="Phone" type="tel" value={p.contactPhone} onChange={(contactPhone) => set({ contactPhone }, "phone")} placeholder="+385 …" />
      </div>
      <div>
        <Label htmlFor="wb-language">Website language</Label>
        <Select id="wb-language" value={p.language} onChange={(event) => studio.change(withProfile(document, { language: event.target.value as WebsiteDocument["profile"]["language"] }))}>
          {WEBSITE_LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {LANGUAGE_NAMES[code] ?? code}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-[12px] text-zinc-500">Sets the page language for browsers and search engines. Write your text in this language.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Photos                                                          */
/* ------------------------------------------------------------------ */

export function PhotosStep({ studio, document }: StepProps) {
  const { pending, uploadFiles, dismiss } = useUploader(studio.upload);
  const add = (files: File[]) => {
    const room = WEBSITE_LIMITS.galleryImages - document.gallery.length;
    void uploadFiles(files.slice(0, Math.max(0, room)), (image) => {
      // Uploads finish one by one; always add to the newest document.
      studio.change(addGalleryImages(studioDocument(studio) ?? document, [image]));
    });
  };
  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Photographs"
        title="Photographs do most of the work."
        description="Wide, light-filled images work best. The first one becomes your cover. Drag to change the order."
      />
      <Dropzone onFiles={add} />
      {document.gallery.length === 0 ? <StarterPhotosButton theme={document.theme} onUse={(images) => studio.change(addGalleryImages(document, images))} /> : null}
      <PhotoGrid
        images={document.gallery}
        pending={pending}
        onReorder={(images) => studio.change(setGallery(document, images))}
        onRemove={(url) => studio.change(removeGalleryImage(document, url))}
        onCover={(url) => studio.change(setCoverImage(document, url))}
        onDismiss={dismiss}
      />
      {document.gallery.length ? (
        <div className="flex items-center justify-between text-[12px] text-zinc-500">
          <span>
            {document.gallery.length} of {WEBSITE_LIMITS.galleryImages} photographs
          </span>
          <button type="button" className="text-zinc-400 hover:text-white" onClick={() => studio.change(setGallery(document, []))}>
            Remove all
          </button>
        </div>
      ) : null}
      <ul className="space-y-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-[12.5px] leading-relaxed text-zinc-400">
        <li className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" /> Lead with the view or the best room, shot in daylight.</li>
        <li className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" /> Mix wide shots with a few close details: linen, a table, a doorway.</li>
        <li className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" /> Landscape photographs fill full-screen sections best.</li>
      </ul>
    </div>
  );
}

// The uploader resolves after the component may have re-rendered; read the freshest document.
function studioDocument(studio: WebsiteStudioApi) {
  return studio.getDocument() ?? studio.document;
}

/* ------------------------------------------------------------------ */
/* 4. Stays                                                           */
/* ------------------------------------------------------------------ */

export function StaysStep({ studio, document }: StepProps) {
  const byProperty = new Map(studio.properties.map((property) => [property.id, property]));
  const stays = studio.authenticated
    ? document.accommodations.filter((stay) => stay.propertyId && byProperty.get(stay.propertyId)?.isPublic !== false && byProperty.has(stay.propertyId))
    : [];

  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Stays"
        title="What can guests book?"
        description="Your website shows the same stays as your booking site. Photos, price, guests and availability come from each Hostvia property, so there is nothing to type twice."
      />

      <StayConnectionNotice studio={studio} />

      {stays.length ? (
        <ul className="space-y-2.5">
          {stays.map((stay) => {
            const property = byProperty.get(stay.propertyId as string);
            const photo = property?.imageUrl ?? property?.galleryUrls[0];
            return (
              <li key={stay.id} className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center gap-3">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="h-11 w-14 rounded-lg object-cover" />
                  ) : (
                    <span className="grid h-11 w-14 place-items-center rounded-lg bg-white/5"><BedDouble className="h-4 w-4 text-zinc-500" /></span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-white">{property?.name ?? stay.name}</span>
                    <span className="block truncate text-[12px] text-zinc-500">
                      {[
                        KIND_LABELS[stay.kind],
                        property?.capacity ? `${property.capacity} guests` : null,
                        property?.startingPrice ? `from ${property.currencyCode} ${property.startingPrice}` : null,
                      ].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-200">Live from Hostvia</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ACCOMMODATION_KINDS.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => studio.change(updateAccommodation(document, stay.id, { kind }))}
                      className={cn("rounded-full border px-2.5 py-1 text-[12px] transition", stay.kind === kind ? "border-violet-400/60 bg-violet-500/15 text-violet-100" : "border-white/10 text-zinc-400 hover:text-zinc-100")}
                    >
                      {KIND_LABELS[kind]}
                    </button>
                  ))}
                </div>
                <Field
                  label="Short line for the website (optional)"
                  multiline
                  rows={2}
                  maxLength={WEBSITE_LIMITS.shortText}
                  value={stay.summary}
                  onChange={(summary) => studio.change(updateAccommodation(document, stay.id, { summary }), { coalesce: `stay.${stay.id}.summary` })}
                  placeholder={property?.shortDescription || "Two bedrooms, a terrace and a view of the bay."}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* 5. Pages                                                           */
/* ------------------------------------------------------------------ */

const PAGE_INFO: Partial<Record<WebsitePageType, { icon: ReactNode; text: string }>> = {
  home: { icon: <Home className="h-4 w-4" />, text: "Your first impression. Always on." },
  about: { icon: <Info className="h-4 w-4" />, text: "The story of the place and the host." },
  accommodation: { icon: <BedDouble className="h-4 w-4" />, text: "Every stay, with live prices." },
  amenities: { icon: <Sparkles className="h-4 w-4" />, text: "What is in the house." },
  gallery: { icon: <ImageIcon className="h-4 w-4" />, text: "All your photographs." },
  location: { icon: <MapPin className="h-4 w-4" />, text: "Where you are, with a map." },
  experiences: { icon: <Sparkles className="h-4 w-4" />, text: "Things to do nearby." },
  reviews: { icon: <MessageSquareQuote className="h-4 w-4" />, text: "Words from past guests." },
  faq: { icon: <Info className="h-4 w-4" />, text: "Practical questions, answered." },
  contact: { icon: <Users className="h-4 w-4" />, text: "How to reach you." },
  custom: { icon: <Plus className="h-4 w-4" />, text: "A page of your own." },
};

export function PagesStep({ studio, document }: StepProps) {
  const pages = document.pages.filter((page) => page.type !== "accommodation_unit");
  const units = document.pages.filter((page) => page.type === "accommodation_unit");
  return (
    <div>
      <SectionTitle
        eyebrow="Pages"
        title="Choose your pages."
        description="Start small. Each page comes composed and written; you can edit every word later."
      />
      <ul className="grid gap-2">
        {pages.map((page) => {
          const info = PAGE_INFO[page.type] ?? PAGE_INFO.custom!;
          return (
            <li key={page.id}>
              <button
                type="button"
                disabled={page.isHome}
                onClick={() => studio.change(updatePage(document, page.id, { enabled: !page.enabled }))}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                  page.enabled ? "border-white/15 bg-white/[0.05]" : "border-white/[0.06] bg-transparent opacity-70 hover:opacity-100",
                  page.isHome && "cursor-default"
                )}
                aria-pressed={page.enabled}
              >
                <span className={cn("grid h-9 w-9 place-items-center rounded-lg", page.enabled ? "bg-violet-500/15 text-violet-200" : "bg-white/5 text-zinc-500")}>{info.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-white">{page.title}</span>
                  <span className="block text-[12px] text-zinc-500">{info.text}</span>
                </span>
                <span className={cn("grid h-5 w-5 place-items-center rounded-md border transition", page.enabled ? "border-violet-400 bg-violet-500 text-white" : "border-white/20 text-transparent")}>
                  <Check className="h-3 w-3" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {units.length ? (
        <p className="mt-4 text-[12.5px] leading-relaxed text-zinc-500">
          Plus {units.length === 1 ? "a page" : `${units.length} pages`} for your {units.length === 1 ? "stay" : "stays"} ({units.map((page) => page.title).join(", ")}), created automatically.
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Look                                                            */
/* ------------------------------------------------------------------ */

export function LookStep({ studio, document }: StepProps) {
  const meta = themeMeta(document.theme);
  const design = document.design;
  const setDesign = (patch: Partial<WebsiteDocument["design"]>) => studio.change({ ...document, design: { ...design, ...patch } });
  return (
    <div className="space-y-7">
      <SectionTitle eyebrow="Look" title="Fine-tune the mood." description={`${meta.name} comes with three palettes, each drawn for the design.`} />
      <div>
        <Label>Palette</Label>
        <div className="grid grid-cols-3 gap-2.5">
          {meta.palettes.map((palette) => {
            const t = paletteFor(document.theme, palette.id).tokens;
            const selected = design.paletteId === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => setDesign({ paletteId: palette.id })}
                aria-pressed={selected}
                className={cn("overflow-hidden rounded-xl border text-left transition", selected ? "border-violet-400 shadow-[0_0_0_3px_rgba(139,92,246,0.25)]" : "border-white/10 hover:border-white/25")}
              >
                <div className="relative h-20 p-2.5" style={{ background: t.bg, color: t.ink }}>
                  <span className="block text-[20px] leading-none" style={{ fontFamily: `var(--font-wb-${document.theme === "minimal" ? "minimal-sans" : `${document.theme}-serif`})` }}>Aa</span>
                  <span className="absolute bottom-2 left-2.5 right-2.5 flex h-2 overflow-hidden rounded-full">
                    <span className="flex-1" style={{ background: t.surface }} />
                    <span className="flex-1" style={{ background: t.accent }} />
                    <span className="flex-1" style={{ background: t.deep }} />
                  </span>
                </div>
                <span className="flex items-center justify-between bg-white/[0.03] px-2.5 py-2 text-[12.5px] font-medium text-zinc-200">
                  {palette.label}
                  {selected ? <Check className="h-3.5 w-3.5 text-violet-300" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label>Motion</Label>
        <Segmented
          label="Motion"
          value={design.animation}
          onChange={(animation) => setDesign({ animation })}
          options={[
            { value: "elegant", label: "Cinematic" },
            { value: "subtle", label: "Subtle" },
            { value: "none", label: "Still" },
          ]}
        />
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
          {design.animation === "elegant"
            ? `${meta.motion}. Visitors who ask their device for less motion always get a still page.`
            : design.animation === "subtle"
              ? "Gentle fades only, no parallax or pinned sections."
              : "No animation at all. Everything is visible immediately."}
        </p>
      </div>
      <div>
        <Label>Headline size</Label>
        <Segmented
          label="Headline size"
          value={design.headingScale}
          onChange={(headingScale) => setDesign({ headingScale })}
          options={[
            { value: "standard", label: "Balanced" },
            { value: "large", label: "Dramatic" },
          ]}
        />
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-[12.5px] text-zinc-400">
          Typography: <span className="text-zinc-200">{meta.typography.display}</span> with <span className="text-zinc-200">{meta.typography.text}</span>
        </p>
        <Toggle
          checked={design.hideBranding}
          onChange={(hideBranding) => setDesign({ hideBranding })}
          label="Hide “Website by Hostvia” in the footer"
          description="A Pro feature. On free accounts the footer credit stays when you publish."
        />
      </div>
    </div>
  );
}
