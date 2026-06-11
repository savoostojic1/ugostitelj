"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Minus, Plus } from "lucide-react";
import type { PublicHostProfile } from "@/lib/public/types";
import {
  getEmbedZoom,
  isAllowedMapEmbedUrl,
  setEmbedZoom,
} from "@/lib/public/google-maps-embed";
import { PublicSectionHeader } from "@/components/public/public-section-header";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 21;

interface HostPublicMapProps {
  host: PublicHostProfile;
}

export function HostPublicMap({ host }: HostPublicMapProps) {
  const embedUrl = host.map_embed_url;
  const baseZoom = useMemo(
    () => (embedUrl ? getEmbedZoom(embedUrl) : 17),
    [embedUrl]
  );

  const [zoom, setZoom] = useState(baseZoom);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const [activeIndex, setActiveIndex] = useState(0);
  const [sources, setSources] = useState<[string, string]>(() => {
    const initial = embedUrl ? setEmbedZoom(embedUrl, baseZoom) : "";
    return [initial, initial];
  });

  const targetSrc = useMemo(
    () => (embedUrl ? setEmbedZoom(embedUrl, zoom) : ""),
    [embedUrl, zoom]
  );
  const isTransitioning = sources[activeIndex] !== targetSrc;

  useEffect(() => {
    if (!embedUrl) return;
    const initial = setEmbedZoom(embedUrl, baseZoom);
    setZoom(baseZoom);
    setActiveIndex(0);
    setSources([initial, initial]);
  }, [embedUrl, baseZoom]);

  useEffect(() => {
    if (!embedUrl || !targetSrc) return;

    setSources((prev) => {
      if (prev[activeIndex] === targetSrc) return prev;

      const inactive = 1 - activeIndex;
      if (prev[inactive] === targetSrc) return prev;

      const next: [string, string] = [...prev];
      next[inactive] = targetSrc;
      return next;
    });
  }, [targetSrc, embedUrl, activeIndex]);

  function handleIframeLoad(index: number) {
    const expected = embedUrl
      ? setEmbedZoom(embedUrl, zoomRef.current)
      : null;
    if (!expected) return;

    setSources((prev) => {
      if (prev[index] === expected) {
        setActiveIndex(index);
      }
      return prev;
    });
  }

  if (!embedUrl || !isAllowedMapEmbedUrl(embedUrl)) return null;

  return (
    <section className="public-section--map">
      <div className="public-section-inner public-section--map-inner">
        <PublicSectionHeader
          index="03"
          kicker="Location"
          title="Where to find us"
          description={host.location ?? undefined}
          icon={<MapPin className="h-3.5 w-3.5" />}
        />

        <div className="public-animate-in public-animate-in-delay-2 mt-10 overflow-hidden rounded-2xl border border-[var(--public-border)] bg-white shadow-[var(--public-shadow-md)]">
          <div className="relative aspect-[16/10] w-full bg-[var(--public-bg-subtle)] md:aspect-[21/9]">
            {sources.map((src, index) => (
              <iframe
                key={`map-layer-${index}`}
                title={`Map — ${host.business_name}`}
                src={src}
                className={cn(
                  "absolute inset-0 h-full w-full border-0 transition-opacity duration-300",
                  activeIndex === index
                    ? "z-[2] opacity-100"
                    : "z-[1] opacity-0 pointer-events-none"
                )}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                onLoad={() => handleIframeLoad(index)}
              />
            ))}

            {isTransitioning ? (
              <div className="pointer-events-none absolute inset-0 z-[3] bg-white/20" />
            ) : null}

            <div className="absolute right-3 top-3 z-[4] flex flex-col overflow-hidden rounded-xl border border-[var(--public-border)] bg-white/95 shadow-[var(--public-shadow-md)] backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
                disabled={zoom >= MAX_ZOOM}
                className={cn(
                  "flex h-10 w-10 items-center justify-center text-[var(--public-fg)] transition",
                  "hover:bg-[var(--public-accent-soft)] hover:text-[var(--public-accent)]",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
                aria-label="Zoom in map"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="border-y border-[var(--public-border)] px-2 py-1 text-center text-[11px] font-semibold tabular-nums text-[var(--public-muted)]">
                {zoom}
              </div>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
                disabled={zoom <= MIN_ZOOM}
                className={cn(
                  "flex h-10 w-10 items-center justify-center text-[var(--public-fg)] transition",
                  "hover:bg-[var(--public-accent-soft)] hover:text-[var(--public-accent)]",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
                aria-label="Zoom out map"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
