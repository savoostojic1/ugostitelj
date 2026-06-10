"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicGalleryLightboxProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  title: string;
}

export function PublicGalleryLightbox({
  open,
  onClose,
  images,
  index,
  onIndexChange,
  title,
}: PublicGalleryLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const hasMultiple = images.length > 1;
  const active = images[index];

  const showPrev = useCallback(() => {
    onIndexChange((index - 1 + images.length) % images.length);
    setZoomed(false);
  }, [images.length, index, onIndexChange]);

  const showNext = useCallback(() => {
    onIndexChange((index + 1) % images.length);
    setZoomed(false);
  }, [images.length, index, onIndexChange]);

  useEffect(() => {
    if (!open) {
      setZoomed(false);
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasMultiple) showPrev();
      if (e.key === "ArrowRight" && hasMultiple) showNext();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, hasMultiple, showPrev, showNext]);

  if (!open || !active || typeof document === "undefined") return null;

  return createPortal(
    <div className="public-site">
      <div
        className="fixed inset-0 z-[250] flex flex-col bg-black/92 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={`Galerija: ${title}`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
          <p className="truncate text-sm font-medium">
            {title}
            {hasMultiple ? (
              <span className="ml-2 text-white/60">
                {index + 1} / {images.length}
              </span>
            ) : null}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
              aria-label={zoomed ? "Smanji" : "Uvećaj"}
            >
              {zoomed ? (
                <ZoomOut className="h-5 w-5" />
              ) : (
                <ZoomIn className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
              aria-label="Zatvori"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4"
          onClick={onClose}
        >
          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 md:left-6"
                aria-label="Prethodna"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 md:right-6"
                aria-label="Sljedeća"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <div
            className={cn(
              "relative max-h-full max-w-full transition-transform duration-300 ease-out",
              zoomed ? "h-full w-full cursor-grab overflow-auto" : "h-auto w-auto"
            )}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={() => setZoomed((z) => !z)}
          >
            <div
              className={cn(
                "relative transition-transform duration-300 ease-out",
                zoomed
                  ? "min-h-[min(100%,80vh)] min-w-[min(100%,95vw)] scale-[1.75] cursor-zoom-out"
                  : "max-h-[calc(100vh-7rem)] w-auto max-w-[min(100vw-2rem,72rem)] cursor-zoom-in"
              )}
            >
              <Image
                key={active}
                src={active}
                alt={title}
                width={1920}
                height={1280}
                className={cn(
                  "h-auto max-h-[calc(100vh-7rem)] w-auto max-w-full object-contain",
                  zoomed && "max-h-none max-w-none"
                )}
                sizes="100vw"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>

        {hasMultiple ? (
          <div className="border-t border-white/10 px-4 py-3">
            <div className="public-gallery-thumbs mx-auto flex max-w-3xl justify-center gap-2 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  type="button"
                  onClick={() => {
                    onIndexChange(i);
                    setZoomed(false);
                  }}
                  className={cn(
                    "relative h-12 w-16 shrink-0 snap-center overflow-hidden rounded-md border-2 transition",
                    i === index
                      ? "border-white opacity-100"
                      : "border-white/20 opacity-60 hover:opacity-90"
                  )}
                  aria-label={`Slika ${i + 1}`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
