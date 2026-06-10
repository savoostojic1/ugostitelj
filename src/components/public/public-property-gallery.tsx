"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { PublicGalleryLightbox } from "@/components/public/public-gallery-lightbox";
import { getPropertyImages } from "@/lib/public/property-images";
import { cn } from "@/lib/utils";

interface PublicPropertyGalleryProps {
  name: string;
  imageUrl?: string | null;
  galleryUrls?: string[] | null;
  variant?: "card" | "panel";
  className?: string;
}

export function PublicPropertyGallery({
  name,
  imageUrl,
  galleryUrls,
  variant = "card",
  className,
}: PublicPropertyGalleryProps) {
  const images = getPropertyImages({
    image_url: imageUrl,
    gallery_urls: galleryUrls,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = images[activeIndex] ?? images[0];
  const hasMultiple = images.length > 1;

  function showPrev(e?: React.MouseEvent) {
    e?.stopPropagation();
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }

  function showNext(e?: React.MouseEvent) {
    e?.stopPropagation();
    setActiveIndex((i) => (i + 1) % images.length);
  }

  function openLightbox() {
    setLightboxOpen(true);
  }

  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  if (!active) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-[var(--public-mesh-bg)] text-sm font-medium text-[var(--public-muted-soft)]",
          variant === "card"
            ? "aspect-[4/3] min-h-[200px]"
            : "aspect-[16/10] min-h-[180px]",
          className
        )}
      >
        {name}
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-xl bg-[var(--public-bg)] shadow-sm",
          className
        )}
      >
        <div
          className={cn(
            "group relative w-full overflow-hidden bg-[var(--public-bg)]",
            variant === "card" ? "aspect-[4/3]" : "aspect-[16/10]"
          )}
        >
          <button
            type="button"
            onClick={openLightbox}
            className="absolute inset-0 z-0 cursor-zoom-in"
            aria-label="Otvori fotografiju u punoj veličini"
          />

          <Image
            key={active}
            src={active}
            alt={name}
            fill
            priority={activeIndex === 0}
            className="pointer-events-none object-cover transition-opacity duration-300"
            sizes={
              variant === "card"
                ? "(max-width: 1024px) 100vw, 352px"
                : "(max-width: 1024px) 100vw, 480px"
            }
            unoptimized
          />

          <div className="pointer-events-none absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 md:opacity-100">
            <Expand className="h-4 w-4" />
          </div>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--public-fg)] shadow-md transition hover:scale-105 hover:bg-white md:h-9 md:w-9"
                aria-label="Prethodna slika"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--public-fg)] shadow-md transition hover:scale-105 hover:bg-white md:h-9 md:w-9"
                aria-label="Sljedeća slika"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/35 to-transparent pt-10">
                <div className="relative px-2 pb-2 pt-1">
                  <div className="pointer-events-none absolute inset-y-1 left-0 z-10 w-6 bg-gradient-to-r from-black/50 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-1 right-0 z-10 w-6 bg-gradient-to-l from-black/50 to-transparent" />

                  <div className="public-gallery-thumbs pointer-events-auto flex gap-1.5 overflow-x-auto px-1 py-0.5">
                    {images.map((url, index) => (
                      <button
                        key={`${url}-${index}`}
                        ref={(el) => {
                          thumbRefs.current[index] = el;
                        }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex(index);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex(index);
                          setLightboxOpen(true);
                        }}
                        className={cn(
                          "relative h-11 w-[3.25rem] shrink-0 snap-center overflow-hidden rounded-md border-2 transition",
                          index === activeIndex
                            ? "scale-105 border-white shadow-md"
                            : "border-white/25 opacity-80 hover:border-white/60 hover:opacity-100"
                        )}
                        aria-label={`Slika ${index + 1}`}
                        aria-current={index === activeIndex}
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="52px"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <PublicGalleryLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        title={name}
      />
    </>
  );
}
