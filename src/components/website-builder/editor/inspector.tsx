"use client";

import { StayConnectionNotice } from "@/components/website-builder/stay-connection";
import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { Button, CommitField, Field, Label, PanelHeading, Segmented, Select, Toggle } from "@/components/website-builder/ui";
import { SectionIcon } from "@/components/website-builder/editor/section-picker";
import type { WebsiteStudioApi } from "@/components/website-builder/use-website-studio";
import {
  removePage,
  switchTheme,
  updatePage,
  updateSection,
  withProfile,
} from "@/lib/website-builder/document-ops";
import { ITEM_SECTIONS, SECTION_DESCRIPTIONS, sectionLabel } from "@/lib/website-builder/defaults";
import { moveItem } from "@/lib/website-builder/document-ops";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { thumbUrl } from "@/lib/website-builder/photo-library";
import { WEBSITE_THEME_META, paletteFor, themeMeta } from "@/lib/website-builder/themes";
import type { SectionSettings, WebsiteDocument, WebsitePage, WebsiteSection, WebsiteSectionType } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";

type Tab = "section" | "page" | "site";

const HAS_IMAGE = new Set<WebsiteSectionType>(["hero", "image_text", "full_image", "cta", "gallery"]);
const HAS_CTA = new Set<WebsiteSectionType>(["hero", "image_text", "cta", "contact", "newsletter"]);
const HAS_STAY = new Set<WebsiteSectionType>(["featured_accommodation", "booking", "amenities"]);
const NO_BODY = new Set<WebsiteSectionType>(["full_image"]);
/** Sections that show prices or take inquiries, where an unconnected stay matters. */
const STAY_SECTIONS = new Set<WebsiteSectionType>(["featured_accommodation", "accommodation_grid", "booking"]);

export function Inspector({
  studio,
  document,
  page,
  section,
  tab,
  onTab,
  onRequestImage,
  onSectionAction,
  onSelectPage,
}: {
  studio: WebsiteStudioApi;
  document: WebsiteDocument;
  page: WebsitePage;
  section: WebsiteSection | null;
  tab: Tab;
  onTab: (tab: Tab) => void;
  onRequestImage: (target: { kind: "section"; sectionId: string } | { kind: "og" } | { kind: "logo" }) => void;
  onSectionAction: (sectionId: string, action: "up" | "down" | "duplicate" | "delete") => void;
  onSelectPage: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 gap-1 border-b border-white/[0.06] p-2">
        {(
          [
            ["section", "Section"],
            ["page", "Page"],
            ["site", "Site"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={cn("flex-1 rounded-lg py-1.5 text-[12.5px] font-medium transition", tab === id ? "bg-white/[0.09] text-white" : "text-zinc-500 hover:text-zinc-200")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "section" ? (
          section ? (
            <>
              {STAY_SECTIONS.has(section.type) ? (
                <div className="mb-4">
                  <StayConnectionNotice studio={studio} compact />
                </div>
              ) : null}
              <SectionInspector studio={studio} document={document} page={page} section={section} onRequestImage={onRequestImage} onSectionAction={onSectionAction} />
            </>
          ) : (
            <div className="grid h-full place-items-center px-4 text-center">
              <div>
                <p className="text-[14px] font-medium text-zinc-200">Select a section</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-500">Click any part of the preview, or choose a section on the left. Click text to edit it directly.</p>
              </div>
            </div>
          )
        ) : null}
        {tab === "page" ? <PageInspector studio={studio} document={document} page={page} onRequestImage={onRequestImage} onSelectPage={onSelectPage} /> : null}
        {tab === "site" ? (
          <>
            <div className="mb-6">
              <StayConnectionNotice studio={studio} />
            </div>
            <SiteInspector studio={studio} document={document} onRequestImage={onRequestImage} />
          </>
        ) : null}
      </div>
    </div>
  );
}

function SectionInspector({
  studio,
  document,
  page,
  section,
  onRequestImage,
  onSectionAction,
}: {
  studio: WebsiteStudioApi;
  document: WebsiteDocument;
  page: WebsitePage;
  section: WebsiteSection;
  onRequestImage: (target: { kind: "section"; sectionId: string }) => void;
  onSectionAction: (sectionId: string, action: "up" | "down" | "duplicate" | "delete") => void;
}) {
  const s = section.settings;
  const set = (patch: Partial<SectionSettings> & { visible?: boolean }, key?: string) =>
    studio.change(updateSection(document, page.id, section.id, patch), key ? { coalesce: `${section.id}.${key}` } : undefined);
  const index = page.sections.findIndex((item) => item.id === section.id);
  const linkTargets = [
    { value: "#booking", label: "Booking form on this page" },
    ...document.pages.filter((item) => item.enabled).map((item) => ({ value: item.isHome ? "/" : `/${item.slug}`, label: `Page: ${item.title}` })),
  ];
  const usesPropertyAmenities =
    section.type === "amenities" &&
    (() => {
      const stay = document.accommodations.find((item) => item.id === s.accommodationId) ?? document.accommodations[0];
      return Boolean(stay?.propertyId && studio.properties.some((property) => property.id === stay.propertyId && property.amenities.length));
    })();

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-200">
          <SectionIcon type={section.type} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-white">{sectionLabel(section.type)}</p>
          <p className="text-[12px] text-zinc-500">{SECTION_DESCRIPTIONS[section.type]}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" disabled={index <= 0} onClick={() => onSectionAction(section.id, "up")} aria-label="Move up">
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" disabled={index >= page.sections.length - 1} onClick={() => onSectionAction(section.id, "down")} aria-label="Move down">
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onSectionAction(section.id, "duplicate")}>
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </Button>
        <Button size="sm" variant="danger" className="ml-auto" onClick={() => onSectionAction(section.id, "delete")}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Toggle checked={section.visible} onChange={(visible) => set({ visible })} label="Visible to guests" />
      {section.type === "hero" ? (
        <Toggle
          checked={document.design.heroBooking}
          onChange={(heroBooking) => studio.change({ ...document, design: { ...document.design, heroBooking } })}
          label="Booking bar in the hero"
          description="Dates, guests and a Check availability button. Guests send an inquiry without leaving the page."
        />
      ) : null}

      <div className="space-y-4 border-t border-white/[0.06] pt-4">
        <PanelHeading>Content</PanelHeading>
        <Field label="Eyebrow" value={s.eyebrow} maxLength={80} onChange={(eyebrow) => set({ eyebrow }, "eyebrow")} placeholder="A short label above the heading" />
        <Field label={section.type === "hero" ? "Headline" : "Heading"} value={s.title} maxLength={WEBSITE_LIMITS.title} onChange={(title) => set({ title }, "title")} placeholder={section.type === "hero" ? document.profile.name || "Your property" : "Heading"} />
        {!NO_BODY.has(section.type) ? <Field label="Text" multiline rows={4} value={s.body} maxLength={WEBSITE_LIMITS.text} onChange={(body) => set({ body }, "body")} /> : null}
        {section.type === "video" ? <CommitField label="YouTube or Vimeo link" value={s.videoUrl} onCommit={(videoUrl) => set({ videoUrl })} placeholder="https://youtu.be/…" /> : null}
        {HAS_STAY.has(section.type) && document.accommodations.length > 1 ? (
          <div>
            <Label>Stay</Label>
            <Select value={s.accommodationId} onChange={(event) => set({ accommodationId: event.target.value })}>
              <option value="">First stay</option>
              {document.accommodations.map((stay) => (
                <option key={stay.id} value={stay.id}>
                  {stay.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>

      {HAS_IMAGE.has(section.type) ? (
        <div className="space-y-2 border-t border-white/[0.06] pt-4">
          <PanelHeading>Photograph</PanelHeading>
          <button type="button" onClick={() => onRequestImage({ kind: "section", sectionId: section.id })} className="group relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            {s.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbUrl(s.imageUrl, 640)} alt={s.imageAlt} className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-[12.5px] text-zinc-500">Uses your cover photograph</span>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/50 text-[12.5px] font-medium text-white opacity-0 transition group-hover:opacity-100">
              <span className="flex items-center gap-1.5"><ImagePlus className="h-4 w-4" /> {s.imageUrl ? "Replace" : "Choose photograph"}</span>
            </span>
          </button>
          {s.imageUrl ? (
            <>
              <Field label="Alt text" hint="Describes the photo for screen readers and search" value={s.imageAlt} maxLength={180} onChange={(imageAlt) => set({ imageAlt }, "alt")} />
              <button type="button" onClick={() => set({ imageUrl: "", imageAlt: "" })} className="text-[12px] text-zinc-500 hover:text-zinc-200">
                Use the cover photograph instead
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {HAS_CTA.has(section.type) ? (
        <div className="space-y-4 border-t border-white/[0.06] pt-4">
          <PanelHeading>Button</PanelHeading>
          <Field label="Label" value={s.ctaLabel} maxLength={40} onChange={(ctaLabel) => set({ ctaLabel }, "cta")} placeholder="Leave empty to hide the button" />
          {s.ctaLabel ? (
            <div>
              <Label>Opens</Label>
              <Select value={s.ctaHref || "#booking"} onChange={(event) => set({ ctaHref: event.target.value })}>
                {linkTargets.map((target) => (
                  <option key={target.value} value={target.value}>
                    {target.label}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>
      ) : null}

      {ITEM_SECTIONS.has(section.type) ? (
        usesPropertyAmenities ? (
          <p className="rounded-xl bg-emerald-400/[0.06] p-3 text-[12.5px] leading-relaxed text-emerald-100/80">Amenities come from the connected Hostvia property and update automatically.</p>
        ) : (
          <ItemsEditor
            type={section.type}
            items={s.items}
            onChange={(items, key) => set({ items }, key)}
          />
        )
      ) : null}

      <div className="space-y-4 border-t border-white/[0.06] pt-4">
        <PanelHeading>Layout</PanelHeading>
        {section.type === "image_text" ? (
          <div>
            <Label>Photograph side</Label>
            <Segmented size="sm" value={s.imagePosition} onChange={(imagePosition) => set({ imagePosition })} options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
          </div>
        ) : null}
        <div>
          <Label>Heading alignment</Label>
          <Segmented size="sm" value={s.align} onChange={(align) => set({ align })} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }]} />
        </div>
        <div>
          <Label>Spacing</Label>
          <Segmented size="sm" value={s.spacing} onChange={(spacing) => set({ spacing })} options={[{ value: "compact", label: "Tight" }, { value: "normal", label: "Normal" }, { value: "spacious", label: "Airy" }]} />
        </div>
        <div>
          <Label>Entrance animation</Label>
          <Segmented
            size="sm"
            value={s.animation}
            onChange={(animation) => set({ animation })}
            options={[
              { value: "inherit", label: "Theme" },
              { value: "fade", label: "Fade" },
              { value: "none", label: "None" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ItemsEditor({ type, items, onChange }: { type: WebsiteSectionType; items: SectionSettings["items"]; onChange: (items: SectionSettings["items"], key?: string) => void }) {
  const titleLabel = type === "faq" ? "Question" : type === "reviews" ? "Guest" : type === "amenities" ? "Amenity" : "Title";
  const bodyLabel = type === "faq" ? "Answer" : type === "reviews" ? "Their words" : "Description";
  const showBody = type !== "amenities";
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-2 border-t border-white/[0.06] pt-4">
      <PanelHeading>{type === "faq" ? "Questions" : type === "reviews" ? "Reviews" : type === "amenities" ? "Amenities" : "Items"}</PanelHeading>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-center gap-1 p-1.5">
              {showBody ? (
                <button type="button" onClick={() => setOpen(open === item.id ? null : item.id)} className="min-w-0 flex-1 truncate px-1.5 text-left text-[13px] text-zinc-200">
                  {item.title || <span className="text-zinc-500">Untitled</span>}
                </button>
              ) : (
                <input
                  value={item.title}
                  onChange={(event) => onChange(items.map((entry) => (entry.id === item.id ? { ...entry, title: event.target.value } : entry)), `item.${item.id}.t`)}
                  placeholder={titleLabel}
                  className="min-w-0 flex-1 bg-transparent px-1.5 text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600"
                />
              )}
              <button type="button" disabled={index === 0} onClick={() => onChange(moveItem(items, index, index - 1))} className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" disabled={index === items.length - 1} onClick={() => onChange(moveItem(items, index, index + 1))} className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))} className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 hover:bg-rose-500/20 hover:text-rose-200" aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </div>
            {showBody && open === item.id ? (
              <div className="space-y-3 border-t border-white/[0.06] p-3">
                <Field label={titleLabel} value={item.title} maxLength={WEBSITE_LIMITS.title} onChange={(title) => onChange(items.map((entry) => (entry.id === item.id ? { ...entry, title } : entry)), `item.${item.id}.t`)} />
                <Field label={bodyLabel} multiline rows={3} value={item.body} maxLength={WEBSITE_LIMITS.text} onChange={(body) => onChange(items.map((entry) => (entry.id === item.id ? { ...entry, body } : entry)), `item.${item.id}.b`)} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {items.length < WEBSITE_LIMITS.items ? (
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            const id = crypto.randomUUID();
            onChange([...items, { id, title: "", body: "" }]);
            setOpen(id);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add {titleLabel.toLowerCase()}
        </Button>
      ) : null}
    </div>
  );
}

function SeoSnippet({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-xl bg-white p-3.5 font-[arial,sans-serif]">
      <p className="truncate text-[12px] text-[#4d5156]">{url}</p>
      <p className="mt-0.5 line-clamp-1 text-[17px] leading-snug text-[#1a0dab]">{title}</p>
      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">{description}</p>
    </div>
  );
}

function PageInspector({
  studio,
  document,
  page,
  onRequestImage,
  onSelectPage,
}: {
  studio: WebsiteStudioApi;
  document: WebsiteDocument;
  page: WebsitePage;
  onRequestImage: (target: { kind: "og" }) => void;
  onSelectPage: (id: string) => void;
}) {
  const set = (patch: Parameters<typeof updatePage>[2], key?: string) =>
    studio.change(updatePage(document, page.id, patch), key ? { coalesce: `page.${page.id}.${key}` } : undefined);
  const name = document.profile.name || "Your stay";
  const defaultTitle = page.isHome ? (document.profile.location ? `${name} in ${document.profile.location}` : name) : `${page.title} · ${name}`;
  const seoTitle = page.seo.title && page.seo.title !== page.title ? page.seo.title : "";
  const defaultDescription = document.profile.shortDescription || page.sections.find((section) => section.settings.body)?.settings.body || "";
  const slugBase = (document.profile.name || "your-stay").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "your-stay";
  const unit = page.type === "accommodation_unit";
  return (
    <div className="space-y-5">
      <Field label="Page name" value={page.title} maxLength={WEBSITE_LIMITS.title} onChange={(title) => set({ title }, "title")} />
      {!page.isHome ? (
        <CommitField label="Address" hint={`${slugBase}.hostvia.me/…`} value={page.slug} onCommit={(slug) => set({ slug })} />
      ) : null}
      {unit ? <p className="text-[12px] leading-relaxed text-zinc-500">This page is created for a stay. Rename the stay in the creation steps to change it.</p> : null}
      <div className="space-y-1 rounded-xl border border-white/[0.07] p-2">
        {!page.isHome ? <Toggle checked={page.enabled} onChange={(enabled) => set({ enabled })} label="Published with the site" /> : null}
        {!unit ? <Toggle checked={page.showInNav} onChange={(showInNav) => set({ showInNav })} label="Show in navigation" /> : null}
      </div>

      <div className="space-y-4 border-t border-white/[0.06] pt-4">
        <PanelHeading>Search & sharing</PanelHeading>
        <SeoSnippet
          title={(seoTitle || defaultTitle).slice(0, 70)}
          description={(page.seo.description || defaultDescription || `Stay at ${name}. See rooms, prices and availability, then send a booking inquiry.`).slice(0, 160)}
          url={`${slugBase}.hostvia.me${page.isHome ? "" : ` › ${page.slug}`}`}
        />
        <Field label="Search title" hint={`${(seoTitle || "").length}/70`} value={seoTitle} maxLength={70} placeholder={defaultTitle} onChange={(title) => set({ seo: { ...page.seo, title } }, "seo.title")} />
        <Field label="Search description" multiline rows={3} value={page.seo.description} maxLength={160} placeholder={defaultDescription || "One or two sentences about this page"} onChange={(description) => set({ seo: { ...page.seo, description } }, "seo.desc")} />
        <div>
          <Label>Sharing image</Label>
          <button type="button" onClick={() => onRequestImage({ kind: "og" })} className="relative block aspect-[1.91/1] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] text-[12px] text-zinc-500">
            {page.seo.ogImage || document.gallery[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbUrl(page.seo.ogImage || document.gallery[0].url, 640)} alt="" className="h-full w-full object-cover" />
            ) : (
              "Choose an image"
            )}
            {!page.seo.ogImage ? <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white">Default: cover photograph</span> : null}
          </button>
        </div>
        <Toggle
          checked={page.seo.noindex}
          onChange={(noindex) => set({ seo: { ...page.seo, noindex } })}
          label="Hide this page from search engines"
          description="Pro accounts only. Free websites are always indexable once published."
        />
      </div>
      {!page.isHome && !unit ? (
        <div className="border-t border-white/[0.06] pt-4">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (!window.confirm(`Delete the page “${page.title}”? You can undo this.`)) return;
              const home = document.pages.find((item) => item.isHome);
              studio.change(removePage(document, page.id));
              if (home) onSelectPage(home.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete page
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SiteInspector({ studio, document, onRequestImage }: { studio: WebsiteStudioApi; document: WebsiteDocument; onRequestImage: (target: { kind: "logo" }) => void }) {
  const p = document.profile;
  const design = document.design;
  const setProfile = (patch: Partial<WebsiteDocument["profile"]>, key: string) => studio.change(withProfile(document, patch), { coalesce: `profile.${key}` });
  const setDesign = (patch: Partial<WebsiteDocument["design"]>) => studio.change({ ...document, design: { ...design, ...patch } });
  return (
    <div className="space-y-6">
      <div>
        <PanelHeading>Design</PanelHeading>
        <div className="grid grid-cols-5 gap-1.5">
          {WEBSITE_THEME_META.map((theme) => (
            <button
              key={theme.id}
              type="button"
              title={`${theme.name} · ${theme.tagline}`}
              onClick={() => studio.change(switchTheme(document, theme.id))}
              className={cn("flex flex-col items-center gap-1 rounded-lg border py-2 text-[10.5px] transition", document.theme === theme.id ? "border-violet-400 bg-violet-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white")}
            >
              <span className="flex gap-0.5">
                {theme.swatch.map((color) => (
                  <span key={color} className="h-2 w-2 rounded-full" style={{ background: color }} />
                ))}
              </span>
              {theme.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-zinc-500">{themeMeta(document.theme).description}</p>
      </div>
      <div>
        <Label>Palette</Label>
        <div className="flex gap-2">
          {themeMeta(document.theme).palettes.map((palette) => {
            const t = paletteFor(document.theme, palette.id).tokens;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => setDesign({ paletteId: palette.id })}
                className={cn("flex flex-1 items-center gap-2 rounded-lg border p-1.5 pr-2 text-[12px] transition", design.paletteId === palette.id ? "border-violet-400 text-white" : "border-white/10 text-zinc-400 hover:text-white")}
              >
                <span className="flex overflow-hidden rounded-md ring-1 ring-white/10">
                  <span className="h-6 w-3" style={{ background: t.bg }} />
                  <span className="h-6 w-3" style={{ background: t.accent }} />
                  <span className="h-6 w-3" style={{ background: t.deep }} />
                </span>
                {palette.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label>Motion</Label>
        <Segmented size="sm" value={design.animation} onChange={(animation) => setDesign({ animation })} options={[{ value: "elegant", label: "Cinematic" }, { value: "subtle", label: "Subtle" }, { value: "none", label: "Still" }]} />
      </div>
      <div>
        <Label>Headline size</Label>
        <Segmented size="sm" value={design.headingScale} onChange={(headingScale) => setDesign({ headingScale })} options={[{ value: "standard", label: "Balanced" }, { value: "large", label: "Dramatic" }]} />
      </div>

      <div className="space-y-4 border-t border-white/[0.06] pt-4">
        <PanelHeading>Property</PanelHeading>
        <Field label="Name" value={p.name} maxLength={WEBSITE_LIMITS.title} onChange={(name) => setProfile({ name }, "name")} />
        <Field label="Location" value={p.location} maxLength={160} onChange={(location) => setProfile({ location }, "location")} />
        <Field label="Introduction" multiline rows={3} value={p.shortDescription} maxLength={WEBSITE_LIMITS.shortText} onChange={(shortDescription) => setProfile({ shortDescription }, "desc")} />
        <Field label="Email" type="email" value={p.contactEmail} onChange={(contactEmail) => setProfile({ contactEmail }, "email")} />
        <Field label="Phone" type="tel" value={p.contactPhone} onChange={(contactPhone) => setProfile({ contactPhone }, "phone")} />
        <CommitField label="Google Maps link" hint={p.mapEmbedUrl ? "Map connected" : "Shown on the location section"} value={p.mapEmbedUrl} onCommit={(mapEmbedUrl) => studio.change(withProfile(document, { mapEmbedUrl }))} placeholder="https://maps.google.com/…" />
        <div>
          <Label>Logo</Label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => onRequestImage({ kind: "logo" })} className="grid h-14 w-24 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] text-[11.5px] text-zinc-500 hover:border-white/25">
              {p.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbUrl(p.logoUrl, 320)} alt="Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                "Add logo"
              )}
            </button>
            {p.logoUrl ? (
              <button type="button" onClick={() => studio.change(withProfile(document, { logoUrl: "" }))} className="text-[12px] text-zinc-500 hover:text-zinc-200">
                Remove
              </button>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-zinc-500">Optional. Without a logo, the name is set in the theme’s typeface.</p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-1 border-t border-white/[0.06] pt-4">
        <Toggle
          checked={design.heroBooking}
          onChange={(heroBooking) => setDesign({ heroBooking })}
          label="Booking bar in the hero"
          description="Shown on the homepage and stay pages when a stay exists."
        />
        <Toggle checked={design.hideBranding} onChange={(hideBranding) => setDesign({ hideBranding })} label="Hide Hostvia footer credit" description="Applied on Pro accounts when you publish." />
      </div>
    </div>
  );
}
