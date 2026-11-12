"use client";

import { EText, Frame, Photo, SiteLink, lowestPrice } from "@/components/website-public/primitives";
import { useBooking } from "@/components/website-public/booking/booking-context";
import { HeroBooking } from "@/components/website-public/booking/hero-booking";
import type { PublicWebsiteModel, WebsiteSection } from "@/lib/website-builder/types";

interface HeroProps {
  section: WebsiteSection;
  model: PublicWebsiteModel;
  /** True when this hero is the first section of the page. */
  lead: boolean;
}

function heroImages(section: WebsiteSection, model: PublicWebsiteModel) {
  const stay = model.page.accommodationId
    ? model.stays.find((item) => item.id === model.page.accommodationId)
    : undefined;
  const pool = [
    ...(section.settings.imageUrl ? [{ url: section.settings.imageUrl, alt: section.settings.imageAlt }] : []),
    ...(stay?.photos ?? []),
    ...model.gallery,
    ...model.stays.flatMap((item) => item.photos),
  ].filter((image, index, all) => image.url && all.findIndex((other) => other.url === image.url) === index);
  const fallbackAlt = model.profile.name || "The property";
  // Inner pages open on a different photograph than the homepage cover.
  const offset =
    !model.page.isHome && !section.settings.imageUrl && !stay && pool.length > 1
      ? Math.max(1, model.pages.findIndex((page) => page.id === model.page.id)) % pool.length
      : 0;
  const first = pool[offset];
  const second = pool[(offset + 1) % Math.max(1, pool.length)];
  return {
    primary: first ? { url: first.url, alt: first.alt || fallbackAlt } : { url: "", alt: fallbackAlt },
    secondary: second && second !== first ? { url: second.url, alt: second.alt || fallbackAlt } : null,
    stay,
  };
}

/**
 * The hero headline is set in very large display type. Longer headlines, or a single
 * long word, step the size down so the text never runs off screen or into the
 * booking bar, whatever the host (or the AI) writes.
 */
export function heroFitScale(title: string): number {
  const length = title.trim().length;
  const longestWord = Math.max(0, ...title.split(/\s+/).map((word) => word.length));
  let scale = length <= 18 ? 1 : length <= 28 ? 0.86 : length <= 40 ? 0.72 : length <= 60 ? 0.6 : 0.5;
  if (longestWord > 9) scale = Math.min(scale, Math.max(0.55, 9 / longestWord));
  return Math.round(scale * 100) / 100;
}

function heroFit(title: string): React.CSSProperties | undefined {
  const scale = heroFitScale(title);
  return scale < 1 ? ({ "--wb-type": `calc(var(--wb-type-base, 1) * ${scale})`, maxWidth: `${Math.round(11 / scale)}ch`, lineHeight: scale < 0.8 ? 1.04 : 0.98 } as React.CSSProperties) : undefined;
}

function Cta({ section, model, className }: { section: WebsiteSection; model: PublicWebsiteModel; className?: string }) {
  const booking = useBooking();
  const label = section.settings.ctaLabel;
  const showBar =
    model.design.heroBooking &&
    Boolean(booking?.stays.length || booking?.pending) &&
    (model.page.isHome || model.page.type === "accommodation_unit") &&
    (section.settings.ctaHref || "#booking") === "#booking";
  if (showBar) return <HeroBooking label={label || "Check availability"} />;
  if (!label) return null;
  return (
    <SiteLink className={className ?? "wb-btn"} href={section.settings.ctaHref || "#booking"} preview={model.preview}>
      <EText path="ctaLabel" value={label} placeholder="Button label" />
      <span className="wb-btn-arrow" aria-hidden />
    </SiteLink>
  );
}

export function Hero({ section, model, lead }: HeroProps) {
  const settings = section.settings;
  const { primary, secondary, stay } = heroImages(section, model);
  const title = settings.title || model.profile.name || stay?.name || "Your property";
  const body = settings.body || (model.page.isHome ? model.profile.shortDescription : stay?.summary ?? "");
  const compact = !model.page.isHome;
  const price = lowestPrice(stay ? [stay] : model.stays);
  const location = stay?.location || model.profile.location;
  const priority = lead;

  const eyebrow = (
    <EText as="p" className="wb-kicker" path="eyebrow" value={settings.eyebrow} placeholder="Eyebrow" />
  );
  const heading = (
    <EText as="h1" className="wb-display" path="title" value={title} split placeholder="Headline" style={heroFit(title)} />
  );
  const lede = <EText as="p" className="wb-lede" path="body" value={body} multiline placeholder="A sentence or two" />;
  const cls = `wb-hero wb-hero--${model.theme}${compact ? " is-compact" : ""}`;

  if (model.theme === "coastal") {
    return (
      <header className={cls}>
        <div className="wb-hero-copy">
          <div data-reveal="up">{eyebrow}</div>
          <div data-reveal="lines">{heading}</div>
          <div data-reveal="up" style={{ "--d": "0.25s" } as React.CSSProperties}>
            {lede}
          </div>
          <div className="wb-hero-actions" data-reveal="up" style={{ "--d": "0.4s" } as React.CSSProperties}>
            <Cta section={section} model={model} />
            {location ? <span className="wb-hero-place">{location}</span> : null}
          </div>
        </div>
        <div className="wb-hero-visual">
          <Frame
            className="wb-arch wb-hero-arch"
            src={primary.url}
            alt={primary.alt}
            parallax={0.06}
            reveal="rise"
            priority={priority}
            sizes="(max-width: 860px) 100vw, 50vw"
          />
          {secondary && !compact ? (
            <div className="wb-hero-orb" data-parallax="-0.1">
              <Photo src={secondary.url} alt={secondary.alt} sizes="240px" />
            </div>
          ) : null}
          <svg className="wb-hero-sun" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="49" />
          </svg>
        </div>
      </header>
    );
  }

  if (model.theme === "nature") {
    return (
      <header className={cls} data-progress="view">
        <Frame
          className="wb-hero-bg"
          src={primary.url}
          alt={primary.alt}
          parallax={0.32}
          priority={priority}
          editable
        />
        <div className="wb-hero-veil" aria-hidden />
        <svg className="wb-contour" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden data-parallax="0.12">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M-20 ${70 + i * 34} C 120 ${30 + i * 36}, 220 ${120 + i * 30}, 340 ${70 + i * 34} S 540 ${40 + i * 33}, 640 ${90 + i * 32}`}
            />
          ))}
        </svg>
        <div className="wb-hero-copy">
          <div data-reveal="up">{eyebrow}</div>
          <div data-reveal="lines">{heading}</div>
          <div className="wb-hero-row" data-reveal="up" style={{ "--d": "0.3s" } as React.CSSProperties}>
            {lede}
            <Cta section={section} model={model} />
          </div>
        </div>
        {secondary && !compact ? (
          <div className="wb-hero-inset" data-parallax="-0.14">
            <Frame src={secondary.url} alt={secondary.alt} reveal="curtain" sizes="320px" editable={false} />
            {location ? <span className="wb-hero-coord">{location}</span> : null}
          </div>
        ) : null}
      </header>
    );
  }

  if (model.theme === "minimal") {
    return (
      <header className={cls}>
        <div className="wb-hero-top" data-reveal="fade">
          {eyebrow}
          {location ? <p className="wb-mono">{location}</p> : null}
        </div>
        <div data-reveal="lines">{heading}</div>
        <span className="wb-rule" data-reveal="draw" aria-hidden />
        <div className="wb-hero-row" data-reveal="up" style={{ "--d": "0.2s" } as React.CSSProperties}>
          {lede}
          <Cta section={section} model={model} />
        </div>
        <Frame
          className="wb-hero-image"
          src={primary.url}
          alt={primary.alt}
          parallax={0.08}
          reveal="clip"
          priority={priority}
        />
        {!compact ? (
          <dl className="wb-hero-meta" data-reveal="fade">
            {model.profile.propertyType ? (
              <div>
                <dt>Type</dt>
                <dd>{model.profile.propertyType}</dd>
              </div>
            ) : null}
            <div>
              <dt>Spaces</dt>
              <dd>{String(Math.max(1, model.stays.length)).padStart(2, "0")}</dd>
            </div>
            {price ? (
              <div>
                <dt>From</dt>
                <dd>{price} / night</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </header>
    );
  }

  if (model.theme === "escape") {
    const pinned = !compact && lead;
    return (
      <header className={`${cls}${pinned ? " is-pinned" : ""}`} data-progress={pinned ? "pin" : undefined}>
        <div className="wb-hero-stage">
          <div className="wb-hero-window">
            <Frame src={primary.url} alt={primary.alt} priority={priority} parallax={pinned ? 0 : 0.2} />
          </div>
          <div className="wb-hero-copy">
            <div data-reveal="fade">{eyebrow}</div>
            <div data-reveal="chars">{heading}</div>
            <div className="wb-hero-tail" data-reveal="up" style={{ "--d": "0.5s" } as React.CSSProperties}>
              {lede}
              <Cta section={section} model={model} />
            </div>
          </div>
          {pinned ? (
            <span className="wb-scrollcue" aria-hidden>
              <i />
            </span>
          ) : null}
        </div>
      </header>
    );
  }

  // Luxe
  return (
    <header className={cls} data-progress="view">
      <Frame
        className="wb-hero-media"
        src={primary.url}
        alt={primary.alt}
        parallax={0.22}
        reveal="settle"
        priority={priority}
      />
      <div className="wb-hero-shade" aria-hidden />
      <div className="wb-hero-copy">
        <div data-reveal="up" style={{ "--d": "0.3s" } as React.CSSProperties}>
          {eyebrow}
        </div>
        <div data-reveal="lines" style={{ "--d": "0.45s" } as React.CSSProperties}>
          {heading}
        </div>
        <div className="wb-hero-row" data-reveal="up" style={{ "--d": "0.9s" } as React.CSSProperties}>
          {lede}
          <Cta section={section} model={model} className="wb-btn wb-btn--ghost" />
        </div>
      </div>
      {!compact ? (
        <div className="wb-hero-foot" data-reveal="fade" style={{ "--d": "1.2s" } as React.CSSProperties}>
          <span>{location}</span>
          <span className="wb-scrollcue" aria-hidden>
            <i />
          </span>
          <span>{price ? `From ${price} / night` : model.profile.propertyType}</span>
        </div>
      ) : null}
    </header>
  );
}
