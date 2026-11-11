"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  BedDouble,
  CalendarCheck,
  Columns2,
  Film,
  GalleryHorizontal,
  HelpCircle,
  Image as ImageIcon,
  LayoutGrid,
  ListChecks,
  Mail,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  PanelTop,
  Route,
  StickyNote,
  Type,
  X,
} from "lucide-react";
import { SECTION_DESCRIPTIONS, sectionLabel } from "@/lib/website-builder/defaults";
import type { WebsiteSectionType } from "@/lib/website-builder/types";

const GROUPS: { title: string; items: WebsiteSectionType[] }[] = [
  { title: "Story", items: ["hero", "welcome", "image_text", "full_image", "text", "video"] },
  { title: "Stays & booking", items: ["featured_accommodation", "accommodation_grid", "booking", "cta"] },
  { title: "Details", items: ["gallery", "amenities", "experiences", "reviews", "faq", "location", "contact", "newsletter"] },
];

const ICONS: Record<WebsiteSectionType, typeof Type> = {
  hero: PanelTop,
  welcome: Type,
  image_text: Columns2,
  full_image: ImageIcon,
  text: StickyNote,
  video: Film,
  featured_accommodation: BedDouble,
  accommodation_grid: LayoutGrid,
  booking: CalendarCheck,
  cta: Megaphone,
  gallery: GalleryHorizontal,
  amenities: ListChecks,
  experiences: Route,
  reviews: MessageSquareQuote,
  faq: HelpCircle,
  location: MapPin,
  contact: Mail,
  newsletter: StickyNote,
};

export function SectionIcon({ type, className }: { type: WebsiteSectionType; className?: string }) {
  const Icon = ICONS[type] ?? Type;
  return <Icon className={className} />;
}

export function SectionPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (type: WebsiteSectionType) => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Add a section" className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111017] p-5 text-zinc-100 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold">Add a section</h2>
            <p className="text-[12.5px] text-zinc-500">The theme composes each section in its own style.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{group.title}</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.items.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onPick(type);
                      onClose();
                    }}
                    className="group flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left transition hover:border-violet-400/50 hover:bg-violet-500/[0.07]"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-zinc-300 transition group-hover:bg-violet-500/20 group-hover:text-violet-100">
                      <SectionIcon type={type} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-zinc-100">{sectionLabel(type)}</span>
                      <span className="block text-[11.5px] leading-snug text-zinc-500">{SECTION_DESCRIPTIONS[type]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
