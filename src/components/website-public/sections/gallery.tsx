"use client";

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Photo, useEditApi } from "@/components/website-public/primitives";
import type { PublicWebsiteModel, WebsiteImage, WebsiteSection } from "@/lib/website-builder/types";

export function galleryImages(model: PublicWebsiteModel, section: WebsiteSection): WebsiteImage[] {
  return [
    ...(section.settings.imageUrl ? [{ url: section.settings.imageUrl, alt: section.settings.imageAlt }] : []),
    ...model.gallery,
    ...model.stays.flatMap((stay) => stay.photos),
  ]
    .filter((image, index, all) => image.url && all.findIndex((item) => item.url === image.url) === index)
    .map((image) => ({ url: image.url, alt: image.alt || model.profile.name || "Property photograph" }))
    .slice(0, 24);
}

function Lightbox({ images, index, onClose, onMove }: { images: WebsiteImage[]; index: number; onClose: () => void; onMove: (delta: number) => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onMove(1);
      if (event.key === "ArrowLeft") onMove(-1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onMove]);
  const image = images[index];
  if (!image) return null;
  return createPortal(
    <div className="wb-lightbox" role="dialog" aria-modal="true" aria-label="Photographs" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={image.alt} onClick={(event) => event.stopPropagation()} />
      <p className="wb-lightbox-count">
        {index + 1} / {images.length}
      </p>
      <button type="button" className="wb-lightbox-close" onClick={onClose} aria-label="Close">
        Close
      </button>
      {images.length > 1 ? (
        <>
          <button type="button" className="wb-lightbox-prev" aria-label="Previous photograph" onClick={(event) => { event.stopPropagation(); onMove(-1); }}>
            ←
          </button>
          <button type="button" className="wb-lightbox-next" aria-label="Next photograph" onClick={(event) => { event.stopPropagation(); onMove(1); }}>
            →
          </button>
        </>
      ) : null}
    </div>,
    document.body
  );
}

export function Gallery({ model, section, head }: { model: PublicWebsiteModel; section: WebsiteSection; head: ReactNode }) {
  const api = useEditApi();
  const images = galleryImages(model, section);
  const [open, setOpen] = useState<number | null>(null);
  const move = useCallback(
    (delta: number) => setOpen((current) => (current === null ? null : (current + delta + images.length) % images.length)),
    [images.length]
  );
  const close = useCallback(() => setOpen(null), []);

  const tile = (image: WebsiteImage, index: number, className?: string, extra?: Record<string, string>, key?: string) => (
    <button
      key={key ?? image.url}
      type="button"
      className={`wb-tile ${className ?? ""}`}
      onClick={api ? undefined : () => setOpen(index)}
      aria-label={`Open photograph ${index + 1}: ${image.alt}`}
      style={{ "--i": index } as CSSProperties}
      {...extra}
    >
      <Photo src={image.url} alt={image.alt} sizes="(max-width: 860px) 80vw, 40vw" />
    </button>
  );

  if (images.length === 0) {
    if (!api && !model.preview) return null;
    return (
      <div className="wb-section-inner">
        {head}
        <div className="wb-gallery-empty">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="wb-photo-empty" />
          ))}
          <p>Photographs you upload appear here, composed by the theme.</p>
        </div>
      </div>
    );
  }

  let body: ReactNode;
  if (model.theme === "luxe") {
    body = (
      <div className="wb-hscroll" data-pin-x>
        <div className="wb-hscroll-stage">
          <div className="wb-hscroll-track" data-track>
            <div className="wb-hscroll-intro">{head}</div>
            {images.map((image, index) => tile(image, index, `wb-hs-${index % 4}`))}
            <span className="wb-hscroll-end" aria-hidden />
          </div>
          <div className="wb-hscroll-progress" aria-hidden>
            <i />
          </div>
        </div>
      </div>
    );
    return (
      <>
        {body}
        {open !== null ? <Lightbox images={images} index={open} onClose={close} onMove={move} /> : null}
      </>
    );
  }

  if (model.theme === "nature") {
    const columns: WebsiteImage[][] = [[], [], []];
    images.forEach((image, index) => columns[index % 3].push(image));
    const speeds = ["-0.06", "0.09", "-0.02"];
    body = (
      <div className="wb-layers">
        {columns.map((column, c) => (
          <div key={c} className="wb-layers-col" data-parallax={speeds[c]}>
            {column.map((image) => tile(image, images.indexOf(image)))}
          </div>
        ))}
      </div>
    );
  } else if (model.theme === "escape") {
    const half = Math.ceil(images.length / 2);
    const rows = [images.slice(0, half), images.slice(half).length ? images.slice(half) : images.slice(0, half)];
    body = (
      <div className="wb-drift" data-progress="view">
        {rows.map((row, r) => (
          <div key={r} className={`wb-drift-row wb-drift-row--${r}`}>
            {[...row, ...row].map((image, index) =>
              tile(
                image,
                images.indexOf(image),
                undefined,
                index >= row.length ? { "aria-hidden": "true", tabIndex: "-1" } : undefined,
                `${r}-${index}`
              )
            )}
          </div>
        ))}
      </div>
    );
  } else if (model.theme === "coastal") {
    body = <div className="wb-organic">{images.map((image, index) => tile(image, index, `wb-shape-${index % 5}`, { "data-reveal": "rise" }))}</div>;
  } else {
    body = <div className="wb-grid">{images.map((image, index) => tile(image, index, `wb-span-${index % 6}`, { "data-reveal": "clip" }))}</div>;
  }

  return (
    <div className={`wb-gallery wb-gallery--${model.theme}`}>
      <div className="wb-section-inner">{head}</div>
      {body}
      {open !== null ? <Lightbox images={images} index={open} onClose={close} onMove={move} /> : null}
    </div>
  );
}
