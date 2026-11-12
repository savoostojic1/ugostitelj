"use client";

import { useState, type CSSProperties } from "react";
import {
  Frame,
  Photo,
  Price,
  SiteLink,
  pad,
  priceLabel,
  roman,
  useEditApi,
} from "@/components/website-public/primitives";
import type { PublicStay, PublicWebsiteModel } from "@/lib/website-builder/types";

function facts(stay: PublicStay): string[] {
  return [
    stay.kindLabel,
    stay.capacity ? `Up to ${stay.capacity} guests` : null,
    stay.location || null,
  ].filter((item): item is string => Boolean(item));
}

function EmptyStays({ model }: { model: PublicWebsiteModel }) {
  const api = useEditApi();
  if (!api && !model.preview) return null;
  return (
    <div className="wb-stays-empty">
      <span className="wb-photo-empty" aria-hidden />
      <div>
        <p className="wb-kicker">Accommodation</p>
        <p>Your public Hostvia properties appear here with their photos and live nightly price, just like on your booking site.</p>
      </div>
    </div>
  );
}

/** One stay, presented in depth. */
export function StayFeature({ model, stay, index = 0 }: { model: PublicWebsiteModel; stay?: PublicStay; index?: number }) {
  if (!stay) return <EmptyStays model={model} />;
  const [first, second] = stay.photos;
  const onUnitPage = model.page.type === "accommodation_unit";
  return (
    <article className="wb-feature">
      <div className="wb-feature-media">
        <Frame
          className="wb-feature-main"
          src={first?.url}
          alt={first?.alt || stay.name}
          parallax={0.08}
          reveal="clip"
          editable={false}
          sizes="(max-width: 860px) 100vw, 60vw"
        />
        {second ? (
          <Frame
            className="wb-feature-second"
            src={second.url}
            alt={second.alt || stay.name}
            parallax={-0.1}
            reveal="rise"
            editable={false}
            sizes="(max-width: 860px) 60vw, 26vw"
          />
        ) : null}
      </div>
      <div className="wb-feature-copy" data-reveal="up">
        <p className="wb-feature-index">{model.theme === "luxe" ? roman(index + 1) : pad(index + 1)}</p>
        <h3 className="wb-h3">{stay.name}</h3>
        {stay.summary || stay.description ? <p className="wb-body">{stay.summary || stay.description}</p> : null}
        <ul className="wb-feature-facts">
          {facts(stay).map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        {stay.amenities.length ? (
          <ul className="wb-feature-amenities">
            {stay.amenities.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        <div className="wb-feature-foot">
          <Price stay={stay} />
          <div className="wb-feature-actions">
            {!onUnitPage ? (
              <SiteLink className="wb-link" href={stay.href} preview={model.preview}>
                View the {stay.kindLabel.toLowerCase()}
              </SiteLink>
            ) : null}
            <SiteLink className="wb-btn" href="#booking" preview={model.preview}>
              Request dates
              <span className="wb-btn-arrow" aria-hidden />
            </SiteLink>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Minimal: an index of stays; hovering a row brings its photograph forward. */
function StayIndex({ model, stays }: { model: PublicWebsiteModel; stays: PublicStay[] }) {
  const [active, setActive] = useState(0);
  const current = stays[active] ?? stays[0];
  return (
    <div className="wb-stay-index">
      <ol>
        {stays.map((stay, index) => (
          <li
            key={stay.id}
            data-active={index === active ? "1" : "0"}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            data-reveal="up"
            style={{ "--i": index } as CSSProperties}
          >
            <span className="wb-mono">{pad(index + 1)}</span>
            <SiteLink href={stay.href} preview={model.preview} className="wb-stay-index-name">
              {stay.name}
            </SiteLink>
            <span className="wb-mono">{stay.kindLabel}</span>
            <span className="wb-mono">{stay.capacity ? `${stay.capacity} guests` : "—"}</span>
            <span className="wb-mono">{priceLabel(stay) ?? "On request"}</span>
          </li>
        ))}
      </ol>
      <div className="wb-stay-index-preview" aria-hidden>
        {stays.map((stay, index) => (
          <Photo
            key={stay.id}
            src={stay.photos[0]?.url}
            alt=""
            className={index === active ? "is-active" : undefined}
            sizes="40vw"
          />
        ))}
        {current ? <span className="wb-mono">{current.summary}</span> : null}
      </div>
    </div>
  );
}

export function StayCollection({ model }: { model: PublicWebsiteModel }) {
  const stays = model.stays;
  if (stays.length === 0) return <EmptyStays model={model} />;

  if (model.theme === "minimal") return <StayIndex model={model} stays={stays} />;

  if (model.theme === "coastal") {
    return (
      <div className="wb-rail" role="list">
        {stays.map((stay, index) => (
          <article key={stay.id} className="wb-rail-card" role="listitem" data-reveal="rise" style={{ "--i": index } as CSSProperties}>
            <Frame className="wb-arch" src={stay.photos[0]?.url} alt={stay.photos[0]?.alt || stay.name} editable={false} sizes="(max-width: 860px) 80vw, 30vw" />
            <p className="wb-kicker">{stay.kindLabel}</p>
            <h3 className="wb-h3">
              <SiteLink href={stay.href} preview={model.preview}>
                {stay.name}
              </SiteLink>
            </h3>
            {stay.summary ? <p className="wb-body">{stay.summary}</p> : null}
            <div className="wb-rail-foot">
              <Price stay={stay} />
              {stay.capacity ? <span>{stay.capacity} guests</span> : null}
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (model.theme === "escape") {
    return (
      <div className="wb-stack">
        {stays.map((stay, index) => (
          <article key={stay.id} className="wb-stack-card" style={{ "--i": index } as CSSProperties}>
            <Frame src={stay.photos[0]?.url} alt={stay.photos[0]?.alt || stay.name} editable={false} parallax={0.12} />
            <div className="wb-stack-copy">
              <p className="wb-kicker">
                {pad(index + 1)} — {stay.kindLabel}
              </p>
              <h3 className="wb-h3">{stay.name}</h3>
              {stay.summary ? <p className="wb-body">{stay.summary}</p> : null}
              <div className="wb-stack-foot">
                <Price stay={stay} />
                <SiteLink className="wb-btn wb-btn--light" href={stay.href} preview={model.preview}>
                  Discover
                  <span className="wb-btn-arrow" aria-hidden />
                </SiteLink>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  // Luxe and Nature: alternating editorial rows.
  return (
    <div className={`wb-rows wb-rows--${model.theme}`}>
      {stays.map((stay, index) => (
        <article key={stay.id} className="wb-row" data-flip={index % 2 === 1 ? "1" : "0"}>
          <Frame
            className="wb-row-media"
            src={stay.photos[0]?.url}
            alt={stay.photos[0]?.alt || stay.name}
            parallax={0.1}
            reveal={model.theme === "nature" ? "curtain" : "clip"}
            editable={false}
            sizes="(max-width: 860px) 100vw, 58vw"
          />
          <div className="wb-row-copy" data-reveal="up">
            <span className="wb-row-index">{model.theme === "luxe" ? roman(index + 1) : pad(index + 1)}</span>
            <p className="wb-kicker">{stay.kindLabel}</p>
            <h3 className="wb-h3">
              <SiteLink href={stay.href} preview={model.preview}>
                {stay.name}
              </SiteLink>
            </h3>
            {stay.summary || stay.description ? <p className="wb-body">{stay.summary || stay.description}</p> : null}
            <ul className="wb-feature-facts">
              {facts(stay).map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <div className="wb-row-foot">
              <Price stay={stay} />
              <SiteLink className="wb-link" href={stay.href} preview={model.preview}>
                Discover
              </SiteLink>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
