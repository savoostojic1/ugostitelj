"use client";

import { useCallback, useMemo, useState } from "react";
import { Layers, Monitor, Settings2, Smartphone, Tablet, X } from "lucide-react";
import { toast } from "sonner";
import { PreviewFrame, type Device } from "@/components/website-builder/preview-frame";
import { StructurePanel } from "@/components/website-builder/editor/structure-panel";
import { Inspector } from "@/components/website-builder/editor/inspector";
import { SectionPicker } from "@/components/website-builder/editor/section-picker";
import { ImagePicker } from "@/components/website-builder/photos";
import { Segmented } from "@/components/website-builder/ui";
import type { WebsiteStudioApi } from "@/components/website-builder/use-website-studio";
import type { WebsiteEditApi } from "@/components/website-public/primitives";
import {
  addPage,
  addSection,
  duplicateSection,
  removeSection,
  reorderSections,
  updatePage,
  updateSection,
  withProfile,
} from "@/lib/website-builder/document-ops";
import { sectionLabel } from "@/lib/website-builder/defaults";
import type { PublicWebsiteModel, WebsiteDocument, WebsiteImage, WebsiteSectionType } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";

type ImageTarget = { kind: "section"; sectionId: string } | { kind: "og" } | { kind: "logo" };

export function Editor({
  studio,
  document,
  buildModel,
  pageId,
  onPageChange,
}: {
  studio: WebsiteStudioApi;
  document: WebsiteDocument;
  buildModel: (pageId: string) => PublicWebsiteModel | null;
  pageId: string;
  onPageChange: (id: string) => void;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"section" | "page" | "site">("section");
  const [picker, setPicker] = useState<{ open: boolean; index?: number }>({ open: false });
  const [imageTarget, setImageTarget] = useState<ImageTarget | null>(null);
  const [drawer, setDrawer] = useState<null | "left" | "right">(null);

  const page = document.pages.find((item) => item.id === pageId) ?? document.pages.find((item) => item.isHome) ?? document.pages[0];
  const section = page?.sections.find((item) => item.id === selected) ?? null;
  const model = useMemo(() => (page ? buildModel(page.id) : null), [buildModel, page]);

  const latest = useCallback(() => studio.getDocument() ?? document, [studio, document]);

  const selectSection = useCallback((id: string) => {
    setSelected(id);
    setTab("section");
  }, []);

  const sectionAction = useCallback(
    (sectionId: string, action: "up" | "down" | "duplicate" | "hide" | "delete" | "add-below") => {
      const doc = latest();
      const current = doc.pages.find((item) => item.id === page.id);
      if (!current) return;
      const index = current.sections.findIndex((item) => item.id === sectionId);
      const target = current.sections[index];
      if (!target) return;
      if (action === "up" || action === "down") {
        studio.change(reorderSections(doc, current.id, index, action === "up" ? index - 1 : index + 1));
      } else if (action === "duplicate") {
        const result = duplicateSection(doc, current.id, sectionId);
        studio.change(result.document);
        if (result.sectionId) setSelected(result.sectionId);
      } else if (action === "hide") {
        studio.change(updateSection(doc, current.id, sectionId, { visible: !target.visible }));
      } else if (action === "delete") {
        studio.change(removeSection(doc, current.id, sectionId));
        setSelected(null);
        toast(`${sectionLabel(target.type)} removed`, {
          action: { label: "Undo", onClick: () => studio.undo() },
        });
      } else if (action === "add-below") {
        setPicker({ open: true, index: index + 1 });
      }
    },
    [latest, page, studio]
  );

  const editApi: WebsiteEditApi = useMemo(
    () => ({
      selectedSectionId: selected,
      selectSection,
      editText: (sectionId, path, value) => {
        const doc = latest();
        const current = doc.pages.find((item) => item.id === page.id);
        const target = current?.sections.find((item) => item.id === sectionId);
        if (!current || !target) return;
        const itemMatch = /^items\.(\d+)\.(title|body)$/.exec(path);
        if (itemMatch) {
          const at = Number(itemMatch[1]);
          const field = itemMatch[2] as "title" | "body";
          const items = target.settings.items.map((item, index) => (index === at ? { ...item, [field]: value } : item));
          studio.change(updateSection(doc, current.id, sectionId, { items }));
          return;
        }
        if (path === "title" || path === "body" || path === "eyebrow" || path === "ctaLabel") {
          studio.change(updateSection(doc, current.id, sectionId, { [path]: value }));
        }
      },
      requestImage: (sectionId) => setImageTarget({ kind: "section", sectionId }),
      sectionAction,
      labelFor: (item) => sectionLabel(item.type),
    }),
    [latest, page, sectionAction, selectSection, selected, studio]
  );

  const pickImage = (image: WebsiteImage) => {
    const doc = latest();
    if (!imageTarget) return;
    if (imageTarget.kind === "section") {
      studio.change(updateSection(doc, page.id, imageTarget.sectionId, { imageUrl: image.url, imageAlt: image.alt || doc.profile.name }));
    } else if (imageTarget.kind === "og") {
      studio.change(updatePage(doc, page.id, { seo: { ...page.seo, ogImage: image.url } }));
    } else {
      studio.change(withProfile(doc, { logoUrl: image.url }));
    }
  };

  const addSectionAt = (type: WebsiteSectionType) => {
    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    studio.change(addSection(latest(), page.id, type, { index: picker.index, id }));
    setSelected(id);
    setTab("section");
  };

  if (!page || !model) return null;

  const ownPhotos = [...document.gallery, ...document.accommodations.flatMap((stay) => stay.photos)].filter(
    (image, index, all) => all.findIndex((other) => other.url === image.url) === index
  );

  const structure = (
    <StructurePanel
      document={document}
      page={page}
      selectedSectionId={selected}
      onSelectPage={(id) => {
        onPageChange(id);
        setSelected(null);
        setDrawer(null);
      }}
      onSelectSection={(id) => {
        selectSection(id);
        setDrawer(null);
      }}
      onMoveSection={(from, to) => studio.change(reorderSections(latest(), page.id, from, to))}
      onToggleSection={(id, visible) => studio.change(updateSection(latest(), page.id, id, { visible }))}
      onAddSection={(index) => setPicker({ open: true, index })}
      onAddPage={() => {
        const next = addPage(latest(), { title: "New page" });
        studio.change(next);
        const created = next.pages[next.pages.length - 1];
        if (created) {
          onPageChange(created.id);
          setTab("page");
        }
      }}
    />
  );

  const inspector = (
    <Inspector
      studio={studio}
      document={document}
      page={page}
      section={section}
      tab={tab}
      onTab={setTab}
      onRequestImage={setImageTarget}
      onSectionAction={sectionAction}
      onSelectPage={onPageChange}
    />
  );

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[264px_minmax(0,1fr)_336px]">
      <aside className="hidden min-h-0 border-r border-white/[0.06] bg-[#0b0a10] lg:block">{structure}</aside>

      <div className="relative flex min-h-0 flex-col bg-[#07060a]">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3">
          <button type="button" onClick={() => setDrawer("left")} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] text-zinc-300 hover:bg-white/5 lg:hidden">
            <Layers className="h-4 w-4" /> Structure
          </button>
          <p className="hidden min-w-0 truncate text-[12.5px] text-zinc-500 lg:block">
            Editing <span className="text-zinc-200">{page.title}</span>
            {section ? (
              <>
                {" "}
                · <span className="text-violet-300">{sectionLabel(section.type)}</span>
              </>
            ) : null}
          </p>
          <div className="mx-auto w-[168px] lg:mx-0 lg:ml-auto">
            <Segmented
              size="sm"
              label="Device"
              value={device}
              onChange={setDevice}
              options={[
                { value: "desktop", label: <Monitor className="h-3.5 w-3.5" />, title: "Desktop" },
                { value: "tablet", label: <Tablet className="h-3.5 w-3.5" />, title: "Tablet" },
                { value: "mobile", label: <Smartphone className="h-3.5 w-3.5" />, title: "Mobile" },
              ]}
            />
          </div>
          <button type="button" onClick={() => setDrawer("right")} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] text-zinc-300 hover:bg-white/5 lg:hidden">
            <Settings2 className="h-4 w-4" /> Edit
          </button>
        </div>
        <div className={cn("min-h-0 flex-1", device === "desktop" ? "px-3 pt-3 md:px-5 md:pt-5" : "")}>
          <PreviewFrame model={model} device={device} edit={editApi} />
        </div>
      </div>

      <aside className="hidden min-h-0 border-l border-white/[0.06] bg-[#0b0a10] lg:block">{inspector}</aside>

      {drawer ? (
        <div className="fixed inset-0 z-[150] lg:hidden" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close panel" onClick={() => setDrawer(null)} />
          <div className={cn("absolute bottom-0 top-0 w-[min(88vw,360px)] bg-[#0b0a10] shadow-2xl animate-[wbx-drawer_0.35s_cubic-bezier(0.16,1,0.3,1)]", drawer === "left" ? "left-0" : "right-0")}>
            <button type="button" onClick={() => setDrawer(null)} className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <div className="h-full pt-8">{drawer === "left" ? structure : inspector}</div>
          </div>
        </div>
      ) : null}

      <SectionPicker open={picker.open} onClose={() => setPicker({ open: false })} onPick={addSectionAt} />
      <ImagePicker
        open={imageTarget !== null}
        onClose={() => setImageTarget(null)}
        onPick={pickImage}
        ownPhotos={ownPhotos}
        theme={document.theme}
        upload={studio.upload}
        title={imageTarget?.kind === "logo" ? "Choose a logo" : imageTarget?.kind === "og" ? "Choose a sharing image" : "Choose a photograph"}
      />
    </div>
  );
}
