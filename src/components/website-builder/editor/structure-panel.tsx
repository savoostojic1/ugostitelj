"use client";

import { useState } from "react";
import { BedDouble, Eye, EyeOff, FileText, GripVertical, Home, Plus } from "lucide-react";
import { PanelHeading } from "@/components/website-builder/ui";
import { SectionIcon } from "@/components/website-builder/editor/section-picker";
import { sectionLabel } from "@/lib/website-builder/defaults";
import type { WebsiteDocument, WebsitePage } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";

export function StructurePanel({
  document,
  page,
  selectedSectionId,
  onSelectPage,
  onSelectSection,
  onMoveSection,
  onToggleSection,
  onAddSection,
  onAddPage,
}: {
  document: WebsiteDocument;
  page: WebsitePage;
  selectedSectionId: string | null;
  onSelectPage: (id: string) => void;
  onSelectSection: (id: string) => void;
  onMoveSection: (from: number, to: number) => void;
  onToggleSection: (id: string, visible: boolean) => void;
  onAddSection: (index?: number) => void;
  onAddPage: () => void;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const pages = document.pages.filter((item) => item.type !== "accommodation_unit");
  const units = document.pages.filter((item) => item.type === "accommodation_unit");

  const pageRow = (item: WebsitePage, icon: React.ReactNode) => (
    <li key={item.id}>
      <button
        type="button"
        onClick={() => onSelectPage(item.id)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] transition",
          item.id === page.id ? "bg-white/[0.08] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
          !item.enabled && "opacity-50"
        )}
      >
        <span className="text-zinc-500">{icon}</span>
        <span className="min-w-0 flex-1 truncate">{item.title}</span>
        {!item.enabled ? <span className="text-[10.5px] text-zinc-600">Off</span> : null}
      </button>
    </li>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="max-h-[42%] shrink-0 overflow-y-auto border-b border-white/[0.06] p-3">
        <PanelHeading
          action={
            <button type="button" onClick={onAddPage} className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-white" aria-label="Add page" title="Add page">
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        >
          Pages
        </PanelHeading>
        <ul className="space-y-0.5">
          {pages.map((item) => pageRow(item, item.isHome ? <Home className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />))}
        </ul>
        {units.length ? (
          <>
            <PanelHeading>Stay pages</PanelHeading>
            <ul className="space-y-0.5">{units.map((item) => pageRow(item, <BedDouble className="h-3.5 w-3.5" />))}</ul>
          </>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <PanelHeading
          action={
            <button type="button" onClick={() => onAddSection()} className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-white" aria-label="Add section" title="Add section">
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        >
          Sections · {page.title}
        </PanelHeading>
        <ol className="space-y-0.5">
          {page.sections.map((section, index) => (
            <li
              key={section.id}
              draggable
              onDragStart={(event) => {
                setDrag(index);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setOver(index);
              }}
              onDragEnd={() => {
                setDrag(null);
                setOver(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (drag !== null && drag !== index) onMoveSection(drag, index);
                setDrag(null);
                setOver(null);
              }}
              className={cn(
                "group relative flex items-center gap-1 rounded-lg transition",
                section.id === selectedSectionId ? "bg-violet-500/15 ring-1 ring-violet-400/40" : "hover:bg-white/[0.04]",
                drag === index && "opacity-40",
                over === index && drag !== null && drag !== index && (drag < index ? "shadow-[0_2px_0_0_#a78bfa]" : "shadow-[0_-2px_0_0_#a78bfa]")
              )}
            >
              <span className="grid h-8 w-5 shrink-0 cursor-grab place-items-center text-zinc-600 opacity-0 transition group-hover:opacity-100" aria-hidden>
                <GripVertical className="h-3.5 w-3.5" />
              </span>
              <button type="button" onClick={() => onSelectSection(section.id)} className={cn("flex min-w-0 flex-1 items-center gap-2 py-[7px] text-left text-[13px]", section.visible ? "text-zinc-200" : "text-zinc-600 line-through")}>
                <SectionIcon type={section.type} className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                <span className="truncate">{section.settings.title && section.type !== "hero" ? section.settings.title : sectionLabel(section.type)}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleSection(section.id, !section.visible)}
                className="mr-1 grid h-6 w-6 place-items-center rounded-md text-zinc-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                aria-label={section.visible ? "Hide section" : "Show section"}
                title={section.visible ? "Hide from guests" : "Show to guests"}
              >
                {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => onAddSection()}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2.5 text-[12.5px] font-medium text-zinc-400 transition hover:border-violet-400/50 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add section
        </button>
        <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-zinc-600">Drag to reorder. Click text in the preview to edit it in place.</p>
      </div>
    </div>
  );
}
