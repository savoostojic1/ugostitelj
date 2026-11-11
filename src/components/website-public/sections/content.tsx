"use client";

import type { CSSProperties, ReactNode } from "react";
import { InquiryFlow } from "@/components/website-public/booking/inquiry-flow";
import {
  EText,
  Frame,
  Photo,
  SiteLink,
  lowestPrice,
  pad,
  roman,
  useEditApi,
} from "@/components/website-public/primitives";
import type { PublicWebsiteModel, WebsiteFaqItem, WebsiteSection } from "@/lib/website-builder/types";

type Props = { section: WebsiteSection; model: PublicWebsiteModel };

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/** Heading block shared by most sections. Each theme styles it differently. */
export function SectionHead({
  section,
  align,
  split = true,
  bodyPath = "body",
  showBody = true,
}: {
  section: WebsiteSection;
  align?: "left" | "center";
  split?: boolean;
  bodyPath?: string;
  showBody?: boolean;
}) {
  const api = useEditApi();
  const s = section.settings;
  if (!api && !s.eyebrow && !s.title && !(showBody && s.body)) return null;
  return (
    <header className="wb-head" data-align={align ?? s.align}>
      <div data-reveal="up">
        <EText as="p" className="wb-kicker" path="eyebrow" value={s.eyebrow} placeholder="Eyebrow" />
      </div>
      <div data-reveal="lines">
        <EText as="h2" className="wb-h2" path="title" value={s.title} split={split} placeholder="Section heading" />
      </div>
      {showBody ? (
        <div data-reveal="up" style={delay(0.15)}>
          <EText as="p" className="wb-lede" path={bodyPath} value={s.body} multiline placeholder="A short paragraph" />
        </div>
      ) : null}
    </header>
  );
}

function visibleItems(items: WebsiteFaqItem[], editing: boolean) {
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => editing || item.title || item.body);
}

function images(model: PublicWebsiteModel) {
  return [...model.gallery, ...model.stays.flatMap((stay) => stay.photos)].filter(
    (image, index, all) => image.url && all.findIndex((other) => other.url === image.url) === index
  );
}

export function Intro({ section, model }: Props) {
  const s = section.settings;
  const pool = images(model);
  const price = lowestPrice(model.stays);
  const notes = [
    model.profile.location ? ["Where", model.profile.location] : null,
    model.profile.propertyType ? ["What", model.profile.propertyType] : null,
    model.stays.length ? ["Spaces", pad(model.stays.length)] : null,
    price ? ["From", `${price} / night`] : null,
  ].filter((entry): entry is [string, string] => Boolean(entry));

  return (
    <div className={`wb-intro wb-intro--${model.theme}`}>
      <div className="wb-intro-label" data-reveal="up">
        <EText as="p" className="wb-kicker" path="eyebrow" value={s.eyebrow} placeholder="Eyebrow" />
      </div>
      <div className="wb-intro-main">
        <div data-reveal="lines">
          <EText as="h2" className="wb-statement" path="title" value={s.title} split placeholder="An opening statement" />
        </div>
        <div data-reveal="up" style={delay(0.2)}>
          <EText as="p" className="wb-body wb-intro-body" path="body" value={s.body} multiline placeholder="Two or three sentences" />
        </div>
      </div>
      {(model.theme === "nature" || model.theme === "minimal") && notes.length >= 2 ? (
        <dl className="wb-notes" data-reveal="up" style={delay(0.3)}>
          {notes.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {model.theme === "coastal" && pool[1] ? (
        <div className="wb-intro-orb" data-parallax="-0.08">
          <Photo src={pool[1].url} alt={pool[1].alt || model.profile.name} sizes="220px" />
        </div>
      ) : null}
    </div>
  );
}

export function Story({ section, model }: Props) {
  const s = section.settings;
  const pool = images(model);
  const primary = s.imageUrl
    ? { url: s.imageUrl, alt: s.imageAlt || s.title }
    : pool[1] ?? pool[0] ?? { url: "", alt: "" };
  const secondary = pool.find((image) => image.url !== primary.url && image.url !== pool[0]?.url);
  const twoImages = (model.theme === "luxe" || model.theme === "nature") && secondary;
  return (
    <div className={`wb-story wb-story--${model.theme}`} data-flip={s.imagePosition === "right" ? "1" : "0"}>
      <div className="wb-story-media">
        <Frame
          className="wb-story-main"
          src={primary.url}
          alt={primary.alt || model.profile.name}
          parallax={model.theme === "minimal" ? 0.05 : 0.12}
          reveal={model.theme === "nature" ? "curtain" : model.theme === "coastal" ? "rise" : "clip"}
          sizes="(max-width: 860px) 100vw, 55vw"
        />
        {model.theme === "nature" && primary.alt ? <p className="wb-frame-caption">Fig. 01 — {primary.alt}</p> : null}
        {twoImages ? (
          <Frame
            className="wb-story-second"
            src={secondary!.url}
            alt={secondary!.alt || model.profile.name}
            parallax={-0.16}
            reveal="rise"
            editable={false}
            sizes="(max-width: 860px) 50vw, 22vw"
          />
        ) : null}
      </div>
      <div className="wb-story-copy">
        <div data-reveal="up">
          <EText as="p" className="wb-kicker" path="eyebrow" value={s.eyebrow} placeholder="Eyebrow" />
        </div>
        <div data-reveal="lines">
          <EText as="h2" className="wb-h2" path="title" value={s.title} split placeholder="Heading" />
        </div>
        <div data-reveal="up" style={delay(0.15)}>
          <EText as="p" className="wb-body" path="body" value={s.body} multiline placeholder="A short story" />
        </div>
        <SectionCta section={section} model={model} />
      </div>
    </div>
  );
}

function SectionCta({ section, model, light }: Props & { light?: boolean }) {
  const api = useEditApi();
  const s = section.settings;
  if (!s.ctaLabel && !api) return null;
  if (!s.ctaLabel && api && section.type !== "cta") return null;
  return (
    <div data-reveal="up" style={delay(0.25)}>
      <SiteLink className={`wb-btn${light ? " wb-btn--light" : ""}`} href={s.ctaHref || "#booking"} preview={model.preview}>
        <EText path="ctaLabel" value={s.ctaLabel} placeholder="Button label" />
        <span className="wb-btn-arrow" aria-hidden />
      </SiteLink>
    </div>
  );
}

export function FullImage({ section, model }: Props) {
  const s = section.settings;
  const pool = images(model);
  const image = s.imageUrl ? { url: s.imageUrl, alt: s.imageAlt } : pool[3] ?? pool[0] ?? { url: "", alt: "" };
  return (
    <figure className={`wb-full wb-full--${model.theme}`} data-progress="view">
      <Frame src={image.url} alt={image.alt || model.profile.name} parallax={0.25} sizes="100vw" />
      <figcaption>
        <div data-reveal="up">
          <EText as="p" className="wb-kicker" path="eyebrow" value={s.eyebrow} placeholder="Eyebrow" />
        </div>
        <div data-reveal="lines">
          <EText as="h2" className="wb-h2" path="title" value={s.title} split placeholder="An optional caption" />
        </div>
      </figcaption>
    </figure>
  );
}

export function Amenities({ section, model }: Props) {
  const api = useEditApi();
  const s = section.settings;
  const stay = model.stays.find((item) => item.id === s.accommodationId) ?? model.stays[0];
  const fromProperty = Boolean(stay?.propertyId && stay.amenities.length);
  const rows = fromProperty
    ? stay!.amenities.map((title, index) => ({ item: { id: title, title, body: "" }, index }))
    : visibleItems(s.items, Boolean(api));
  if (!rows.length && !api) return null;
  return (
    <div className={`wb-amen wb-amen--${model.theme}`}>
      <SectionHead section={section} />
      <ul className="wb-amen-list">
        {rows.map(({ item, index }, order) => (
          <li key={item.id} data-reveal="up" style={{ "--i": order } as CSSProperties}>
            <span className="wb-amen-n" aria-hidden>
              {pad(order + 1)}
            </span>
            {fromProperty ? (
              <span>{item.title}</span>
            ) : (
              <EText path={`items.${index}.title`} value={item.title} placeholder="Amenity" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Experiences({ section, model }: Props) {
  const api = useEditApi();
  const s = section.settings;
  const rows = visibleItems(s.items, Boolean(api));
  const pool = images(model);
  if (!rows.length && !api) return null;

  if (model.theme === "escape") {
    return (
      <div className="wb-scrolly" data-steps>
        <div className="wb-scrolly-media" aria-hidden>
          {rows.map((_, order) => {
            const image = pool[(order + 2) % Math.max(1, pool.length)];
            return (
              <span key={order} className="wb-scrolly-img" data-i={order}>
                <Photo src={image?.url} alt="" sizes="50vw" />
              </span>
            );
          })}
        </div>
        <div className="wb-scrolly-copy">
          <SectionHead section={section} />
          <ol>
            {rows.map(({ item, index }, order) => (
              <li key={item.id} data-step data-active={order === 0 ? "1" : "0"}>
                <span className="wb-scrolly-n">{pad(order + 1)}</span>
                <EText as="h3" className="wb-h3" path={`items.${index}.title`} value={item.title} placeholder="Title" />
                <EText as="p" className="wb-body" path={`items.${index}.body`} value={item.body} multiline placeholder="Description" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className={`wb-exp wb-exp--${model.theme}`} data-progress={model.theme === "nature" ? "view" : undefined}>
      <SectionHead section={section} />
      <ol className="wb-exp-list">
        {model.theme === "nature" ? <span className="wb-exp-line" aria-hidden /> : null}
        {rows.map(({ item, index }, order) => {
          const image = pool[(order + 1) % Math.max(1, pool.length)];
          return (
            <li key={item.id} data-reveal="up" style={{ "--i": order } as CSSProperties}>
              {model.theme === "coastal" && image ? (
                <span className="wb-exp-orb">
                  <Photo src={image.url} alt="" sizes="200px" />
                </span>
              ) : null}
              <span className="wb-exp-n">{model.theme === "luxe" ? roman(order + 1) : pad(order + 1)}</span>
              <EText as="h3" className="wb-h3" path={`items.${index}.title`} value={item.title} placeholder="Title" />
              <EText as="p" className="wb-body" path={`items.${index}.body`} value={item.body} multiline placeholder="Description" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Reviews({ section, model }: Props) {
  const api = useEditApi();
  const rows = visibleItems(section.settings.items, Boolean(api));
  if (!rows.length && !api) return null;
  return (
    <div className={`wb-reviews wb-reviews--${model.theme}`}>
      <SectionHead section={section} />
      <div className="wb-reviews-list">
        {rows.map(({ item, index }, order) => (
          <figure key={item.id} data-reveal="up" style={{ "--i": order } as CSSProperties}>
            <EText as="blockquote" path={`items.${index}.body`} value={item.body} multiline placeholder="What the guest said" />
            <EText as="figcaption" path={`items.${index}.title`} value={item.title} placeholder="Guest name" />
          </figure>
        ))}
        {!rows.length ? <p className="wb-muted">Add guest words you have permission to publish.</p> : null}
      </div>
    </div>
  );
}

export function Faq({ section, model }: Props) {
  const api = useEditApi();
  const rows = visibleItems(section.settings.items, Boolean(api));
  if (!rows.length && !api) return null;
  return (
    <div className={`wb-faq wb-faq--${model.theme}`}>
      <SectionHead section={section} />
      <div className="wb-faq-list">
        {rows.map(({ item, index }, order) => (
          <details key={item.id} data-reveal="up" style={{ "--i": order } as CSSProperties} open={api ? true : undefined}>
            <summary>
              <EText path={`items.${index}.title`} value={item.title} placeholder="Question" />
              <span className="wb-faq-icon" aria-hidden />
            </summary>
            <EText as="p" path={`items.${index}.body`} value={item.body} multiline placeholder="Answer" />
          </details>
        ))}
      </div>
    </div>
  );
}

export function CallToAction({ section, model }: Props) {
  const s = section.settings;
  const pool = images(model);
  const imageBacked = model.theme === "luxe" || model.theme === "escape" || model.theme === "nature";
  const image = s.imageUrl ? { url: s.imageUrl, alt: s.imageAlt } : pool[2] ?? pool[0];
  return (
    <div className={`wb-cta wb-cta--${model.theme}${imageBacked ? " has-image" : ""}`}>
      {imageBacked ? (
        <Frame className="wb-cta-bg" src={image?.url} alt={image?.alt || ""} parallax={0.2} sizes="100vw" />
      ) : null}
      <div className="wb-cta-copy">
        <div data-reveal="up">
          <EText as="p" className="wb-kicker" path="eyebrow" value={s.eyebrow} placeholder="Eyebrow" />
        </div>
        <div data-reveal="lines">
          <EText as="h2" className="wb-display" path="title" value={s.title} split placeholder="An invitation" />
        </div>
        <div data-reveal="up" style={delay(0.15)}>
          <EText as="p" className="wb-lede" path="body" value={s.body} multiline placeholder="One sentence" />
        </div>
        <SectionCta section={section} model={model} light={imageBacked} />
      </div>
    </div>
  );
}

export function Booking({ section, model }: Props) {
  const s = section.settings;
  const stay = model.stays.find((item) => item.id === s.accommodationId) ?? model.stays[0];
  return (
    <div className={`wb-book wb-book--${model.theme}`}>
      <div className="wb-book-side">
        <SectionHead section={section} align="left" />
        {stay?.photos[0] ? (
          <Frame className="wb-book-photo" src={stay.photos[0].url} alt={stay.photos[0].alt || stay.name} reveal="clip" editable={false} sizes="(max-width: 860px) 100vw, 40vw" />
        ) : null}
        <ul className="wb-book-notes">
          <li>Send dates and guests. The host replies with availability.</li>
          <li>No payment is taken by this form.</li>
          <li>Dates are reserved once the host confirms.</li>
        </ul>
      </div>
      <InquiryFlow />
    </div>
  );
}

export function Location({ section, model }: Props) {
  const s = section.settings;
  const pool = images(model);
  return (
    <div className={`wb-where wb-where--${model.theme}`}>
      <div className="wb-where-copy">
        <SectionHead section={section} showBody={false} />
        <div data-reveal="up">
          <EText as="p" className="wb-body" path="body" value={s.body || model.profile.location} multiline placeholder="Describe the setting" />
        </div>
        {model.profile.location ? <p className="wb-where-place">{model.profile.location}</p> : null}
      </div>
      <div className="wb-where-map" data-reveal="clip">
        {model.profile.mapEmbedUrl ? (
          <iframe title={`Map of ${model.profile.location || model.profile.name}`} src={model.profile.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          <Photo src={pool[3]?.url ?? pool[0]?.url} alt={pool[3]?.alt || model.profile.location || ""} sizes="50vw" />
        )}
      </div>
    </div>
  );
}

export function Contact({ section, model }: Props) {
  const s = section.settings;
  const { contactEmail, contactPhone, location } = model.profile;
  return (
    <div className={`wb-contact wb-contact--${model.theme}`}>
      <SectionHead section={section} />
      <ul className="wb-contact-list" data-reveal="up">
        {contactEmail ? (
          <li>
            <span>Email</span>
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </li>
        ) : null}
        {contactPhone ? (
          <li>
            <span>Phone</span>
            <a href={`tel:${contactPhone.replace(/\s+/g, "")}`}>{contactPhone}</a>
          </li>
        ) : null}
        {location ? (
          <li>
            <span>Address</span>
            <p>{location}</p>
          </li>
        ) : null}
      </ul>
      {s.ctaLabel ? <SectionCta section={section} model={model} /> : null}
    </div>
  );
}

export function TextBlock({ section }: Props) {
  return (
    <div className="wb-text">
      <SectionHead section={section} split={false} />
    </div>
  );
}

export function Video({ section, model }: Props) {
  const api = useEditApi();
  const s = section.settings;
  if (!s.videoUrl) {
    if (!api && !model.preview) return null;
    return (
      <div className="wb-video">
        <SectionHead section={section} />
        <div className="wb-video-empty">Paste a YouTube or Vimeo link in the section settings.</div>
      </div>
    );
  }
  return (
    <div className="wb-video">
      <SectionHead section={section} />
      <div className="wb-video-frame" data-reveal="clip">
        <iframe
          src={s.videoUrl}
          title={s.title || "Film"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function SectionShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`wb-section-inner ${className ?? ""}`}>{children}</div>;
}
