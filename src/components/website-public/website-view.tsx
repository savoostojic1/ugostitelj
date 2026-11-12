"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useWebsiteMotion } from "@/components/website-public/motion";
import {
  SectionIdProvider,
  SiteLink,
  WebsiteEditContext,
  useEditApi,
  type WebsiteEditApi,
} from "@/components/website-public/primitives";
import { Hero } from "@/components/website-public/sections/hero";
import { StayCollection, StayFeature } from "@/components/website-public/sections/stays";
import { Gallery } from "@/components/website-public/sections/gallery";
import {
  Amenities,
  Booking,
  CallToAction,
  Contact,
  Experiences,
  Faq,
  FullImage,
  Intro,
  Location,
  Reviews,
  SectionHead,
  SectionShell,
  Story,
  TextBlock,
  Video,
} from "@/components/website-public/sections/content";
import { BookingProvider, useBooking } from "@/components/website-public/booking/booking-context";
import { BookingSheet } from "@/components/website-public/booking/inquiry-flow";
import { paletteStyle } from "@/lib/website-builder/themes";
import { formatPropertyPrice } from "@/lib/currency/format";
import type { PublicWebsiteModel, WebsiteSection } from "@/lib/website-builder/types";
import "@/components/website-public/website.css";
import "@/components/website-public/website-themes.css";

/** Sections that run edge to edge; everything else sits in the content column. */
const FULL_BLEED = new Set(["hero", "full_image", "cta", "gallery"]);

function bookingHref(model: PublicWebsiteModel): string {
  if (model.page.sections.some((section) => section.visible && section.type === "booking")) return "#booking";
  const home = model.pages.find((page) => page.isHome);
  if (home?.sections.some((section) => section.visible && section.type === "booking")) return "/#booking";
  const unit = model.pages.find((page) => page.type === "accommodation_unit");
  return unit ? `/${unit.slug}#booking` : "/contact";
}

function SectionBody({ section, model, lead }: { section: WebsiteSection; model: PublicWebsiteModel; lead: boolean }) {
  const s = section.settings;
  switch (section.type) {
    case "hero":
      return <Hero section={section} model={model} lead={lead} />;
    case "welcome":
      return (
        <SectionShell>
          <Intro section={section} model={model} />
        </SectionShell>
      );
    case "image_text":
      return (
        <SectionShell>
          <Story section={section} model={model} />
        </SectionShell>
      );
    case "full_image":
      return <FullImage section={section} model={model} />;
    case "featured_accommodation": {
      const stay = model.stays.find((item) => item.id === s.accommodationId) ?? model.stays[0];
      const index = stay ? model.stays.indexOf(stay) : 0;
      return (
        <SectionShell>
          <SectionHead section={section} />
          <StayFeature model={model} stay={stay} index={index} />
        </SectionShell>
      );
    }
    case "accommodation_grid":
      return (
        <SectionShell className={model.theme === "escape" ? "is-wide" : undefined}>
          <SectionHead section={section} />
          <StayCollection model={model} />
        </SectionShell>
      );
    case "gallery":
      return <Gallery model={model} section={section} head={<SectionHead section={section} />} />;
    case "amenities":
      return (
        <SectionShell>
          <Amenities section={section} model={model} />
        </SectionShell>
      );
    case "experiences":
      return model.theme === "escape" ? (
        <Experiences section={section} model={model} />
      ) : (
        <SectionShell>
          <Experiences section={section} model={model} />
        </SectionShell>
      );
    case "reviews":
      return (
        <SectionShell>
          <Reviews section={section} model={model} />
        </SectionShell>
      );
    case "faq":
      return (
        <SectionShell>
          <Faq section={section} model={model} />
        </SectionShell>
      );
    case "cta":
      return <CallToAction section={section} model={model} />;
    case "booking":
      return (
        <SectionShell>
          <Booking section={section} model={model} />
        </SectionShell>
      );
    case "location":
      return (
        <SectionShell>
          <Location section={section} model={model} />
        </SectionShell>
      );
    case "contact":
    case "newsletter":
      return (
        <SectionShell>
          <Contact section={section} model={model} />
        </SectionShell>
      );
    case "video":
      return (
        <SectionShell>
          <Video section={section} model={model} />
        </SectionShell>
      );
    default:
      return (
        <SectionShell>
          <TextBlock section={section} model={model} />
        </SectionShell>
      );
  }
}

function EditToolbar({ section, api, first, last }: { section: WebsiteSection; api: WebsiteEditApi; first: boolean; last: boolean }) {
  const act = (action: Parameters<WebsiteEditApi["sectionAction"]>[1]) => (event: React.MouseEvent) => {
    event.stopPropagation();
    api.sectionAction(section.id, action);
  };
  return (
    <div className="wbx-toolbar" role="toolbar" aria-label={`${api.labelFor(section)} actions`} onClick={(event) => event.stopPropagation()}>
      <span className="wbx-toolbar-label">{api.labelFor(section)}</span>
      <button type="button" onClick={act("up")} disabled={first} aria-label="Move up" title="Move up">
        <ArrowUp />
      </button>
      <button type="button" onClick={act("down")} disabled={last} aria-label="Move down" title="Move down">
        <ArrowDown />
      </button>
      <button type="button" onClick={act("duplicate")} aria-label="Duplicate" title="Duplicate">
        <Copy />
      </button>
      <button type="button" onClick={act("hide")} aria-label={section.visible ? "Hide" : "Show"} title={section.visible ? "Hide from guests" : "Show to guests"}>
        {section.visible ? <EyeOff /> : <Eye />}
      </button>
      <button type="button" onClick={act("delete")} aria-label="Delete" title="Delete" className="is-danger">
        <Trash2 />
      </button>
    </div>
  );
}

function SectionFrame({
  section,
  model,
  index,
  count,
  lead,
}: {
  section: WebsiteSection;
  model: PublicWebsiteModel;
  index: number;
  count: number;
  lead: boolean;
}) {
  const api = useEditApi();
  const selected = api?.selectedSectionId === section.id;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selected && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const scroller = ref.current.closest("[data-wbx-canvas]");
      if (!scroller) return;
      const box = scroller.getBoundingClientRect();
      if (rect.top > box.bottom - 80 || rect.bottom < box.top + 80) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selected]);

  return (
    <section
      ref={ref}
      id={section.type === "booking" ? "booking" : undefined}
      className={`wb-s wb-s--${section.type}${FULL_BLEED.has(section.type) ? " is-bleed" : ""}`}
      data-space={section.settings.spacing}
      data-anim={section.settings.animation}
      data-align={section.settings.align}
      data-wb-section={api ? section.id : undefined}
      data-selected={api ? (selected ? "1" : "0") : undefined}
      data-hidden={api && !section.visible ? "1" : undefined}
      onClick={api ? () => api.selectSection(section.id) : undefined}
      aria-label={api ? api.labelFor(section) : undefined}
    >
      <SectionIdProvider value={section.id}>
        <SectionBody section={section} model={model} lead={lead} />
      </SectionIdProvider>
      {api ? (
        <>
          <EditToolbar section={section} api={api} first={index === 0} last={index === count - 1} />
          <button
            type="button"
            className="wbx-insert"
            onClick={(event) => {
              event.stopPropagation();
              api.sectionAction(section.id, "add-below");
            }}
          >
            <Plus /> Add section
          </button>
        </>
      ) : null}
    </section>
  );
}

function Navigation({ model }: { model: PublicWebsiteModel }) {
  const [open, setOpen] = useState(false);
  const booking = useBooking();
  const editing = Boolean(useEditApi());
  const canInquire = Boolean(booking?.stays.length || booking?.pending);
  const home = model.pages.find((page) => page.isHome);
  const items = (home ? [home, ...model.navPages.filter((page) => !page.isHome)] : model.navPages).map((page) => ({
    id: page.id,
    href: page.isHome ? "/" : `/${page.slug}`,
    label: page.isHome ? "Home" : page.title,
    current: page.id === model.page.id,
  }));
  const reserve = bookingHref(model);
  const limit = model.theme === "luxe" ? 4 : 5;
  const inline = items.slice(0, limit);
  const brand = (
    <SiteLink href="/" className="wb-brand" preview={model.preview} ariaLabel={`${model.profile.name || "Home"}, home`}>
      {model.profile.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={model.profile.logoUrl} alt="" />
      ) : null}
      <span>{model.profile.name || "Your stay"}</span>
    </SiteLink>
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="wb-nav" data-open={open ? "1" : "0"} data-more={items.length > limit ? "1" : "0"}>
      <div className="wb-nav-bar">
        {brand}
        <nav className="wb-nav-links" aria-label="Main">
          {inline.map((item, index) => (
            <SiteLink key={item.id} href={item.href} preview={model.preview} className={item.current ? "is-current" : undefined}>
              {model.theme === "minimal" ? <span className="wb-nav-n">{String(index + 1).padStart(2, "0")}</span> : null}
              {item.label}
            </SiteLink>
          ))}
        </nav>
        <div className="wb-nav-end">
          {canInquire ? (
            <button type="button" className="wb-nav-cta" onClick={() => !editing && booking?.open()}>
              Reserve
            </button>
          ) : (
            <SiteLink href={reserve} className="wb-nav-cta" preview={model.preview}>
              Reserve
            </SiteLink>
          )}
          <button
            type="button"
            className="wb-nav-toggle"
            aria-expanded={open}
            aria-controls="wb-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="wb-burger" aria-hidden />
            <span>{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>
      <div id="wb-menu" className="wb-menu" hidden={!open}>
        <nav aria-label="Menu">
          {items.map((item, index) => (
            <SiteLink key={item.id} href={item.href} preview={model.preview} className={item.current ? "is-current" : undefined}>
              <span className="wb-menu-n">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </SiteLink>
          ))}
        </nav>
        <div className="wb-menu-foot">
          {model.profile.contactEmail ? <a href={`mailto:${model.profile.contactEmail}`}>{model.profile.contactEmail}</a> : null}
          {model.profile.contactPhone ? <a href={`tel:${model.profile.contactPhone.replace(/\s+/g, "")}`}>{model.profile.contactPhone}</a> : null}
          {canInquire ? (
            <button
              type="button"
              className="wb-btn"
              onClick={() => {
                setOpen(false);
                if (!editing) booking?.open();
              }}
            >
              Reserve
              <span className="wb-btn-arrow" aria-hidden />
            </button>
          ) : (
            <SiteLink href={reserve} className="wb-btn" preview={model.preview}>
              Reserve
              <span className="wb-btn-arrow" aria-hidden />
            </SiteLink>
          )}
        </div>
      </div>
    </header>
  );
}

/** Phone-only sticky bar so a guest can always start an inquiry. */
function MobileBookBar({ model }: { model: PublicWebsiteModel }) {
  const booking = useBooking();
  const editing = Boolean(useEditApi());
  if (!booking?.stays.length || editing) return null;
  const priced = booking.stays.filter((stay) => stay.pricePerNight);
  const low = priced.length ? priced.reduce((a, b) => (a.pricePerNight! <= b.pricePerNight! ? a : b)) : null;
  return (
    <div className="wb-mbar">
      <p className="wb-mbar-price">
        {low ? (
          <>
            <span>From</span>
            <strong>{formatPropertyPrice(low.pricePerNight!, low.currencyCode)}</strong>
          </>
        ) : (
          <strong>{model.profile.name || "Your stay"}</strong>
        )}
      </p>
      <button type="button" className="wb-btn" onClick={booking.open}>
        Check availability
        <span className="wb-btn-arrow" aria-hidden />
      </button>
    </div>
  );
}

function Footer({ model }: { model: PublicWebsiteModel }) {
  const year = new Date().getFullYear();
  return (
    <footer className="wb-footer">
      <div
        className="wb-footer-mark"
        aria-hidden
        data-reveal="lines"
        style={{ "--len": Math.max(6, (model.profile.name || "Your stay").length) } as CSSProperties}
      >
        <span className="wb-w">
          <span>{model.profile.name || "Your stay"}</span>
        </span>
      </div>
      <div className="wb-footer-grid">
        <div>
          <p className="wb-footer-name">{model.profile.name || "Your stay"}</p>
          {model.profile.location ? <p>{model.profile.location}</p> : null}
          {model.profile.shortDescription ? <p className="wb-footer-desc">{model.profile.shortDescription}</p> : null}
        </div>
        <nav aria-label="Footer">
          {model.navPages.map((page) => (
            <SiteLink key={page.id} href={page.isHome ? "/" : `/${page.slug}`} preview={model.preview}>
              {page.isHome ? "Home" : page.title}
            </SiteLink>
          ))}
        </nav>
        <div>
          {model.profile.contactEmail ? <a href={`mailto:${model.profile.contactEmail}`}>{model.profile.contactEmail}</a> : null}
          {model.profile.contactPhone ? <a href={`tel:${model.profile.contactPhone.replace(/\s+/g, "")}`}>{model.profile.contactPhone}</a> : null}
        </div>
      </div>
      <div className="wb-footer-base">
        <span>
          © {year} {model.profile.name || "Your stay"}
        </span>
        {model.showBranding ? (
          <a href="https://hostvia.me" className="wb-branding">
            Website by Hostvia
          </a>
        ) : null}
      </div>
    </footer>
  );
}

export function WebsiteView({
  model,
  edit,
  refreshKey,
}: {
  model: PublicWebsiteModel;
  /** Supplied by the builder: enables click-to-select and inline editing. */
  edit?: WebsiteEditApi;
  /** Changes when the surrounding frame changes (device, zoom), so motion re-measures. */
  refreshKey?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const motionMode = model.design.animation;
  useWebsiteMotion(rootRef, { mode: motionMode, refreshKey: `${model.theme}:${model.page.id}:${refreshKey ?? ""}` });

  const sections = model.page.sections.filter((section) => edit || section.visible);
  const themeStyle = paletteStyle(model.theme, model.paletteId) as CSSProperties;
  const overlayNav = sections[0]?.type === "hero" && ["luxe", "nature", "escape"].includes(model.theme);

  const content = (
    <div
      ref={rootRef}
      className={`wb wb-${model.theme}`}
      style={themeStyle}
      data-palette={model.paletteId}
      data-motion={motionMode === "none" ? "off" : motionMode}
      data-scale={model.design.headingScale}
      data-overlay={overlayNav ? "1" : "0"}
      data-editing={edit ? "1" : undefined}
      data-scrolled="0"
      lang={model.language}
      dir={model.language === "ar" || model.language === "he" ? "rtl" : undefined}
    >
      {edit ? null : (
        <a className="wb-skip" href="#wb-main">
          Skip to content
        </a>
      )}
      <Navigation model={model} />
      {model.breadcrumbs.length > 1 && model.page.type === "accommodation_unit" ? (
        <nav className="wb-crumbs" aria-label="Breadcrumb">
          {model.breadcrumbs.map((crumb, index) => (
            <span key={crumb.path}>
              {index > 0 ? <span aria-hidden> / </span> : null}
              <SiteLink href={crumb.path} preview={model.preview}>
                {crumb.name}
              </SiteLink>
            </span>
          ))}
        </nav>
      ) : null}
      <main id="wb-main">
        {sections.map((section, index) => (
          <SectionFrame
            key={section.id}
            section={section}
            model={model}
            index={index}
            count={sections.length}
            lead={index === 0}
          />
        ))}
        {edit && sections.length === 0 ? (
          <div className="wbx-empty-page">
            <p>This page has no sections yet.</p>
          </div>
        ) : null}
      </main>
      <MobileBookBar model={model} />
      <Footer model={model} />
    </div>
  );

  const page = (
    <BookingProvider model={model}>
      {content}
      <BookingSheet themeClass={`wb-${model.theme}`} style={themeStyle} />
    </BookingProvider>
  );
  return edit ? <WebsiteEditContext.Provider value={edit}>{page}</WebsiteEditContext.Provider> : page;
}
