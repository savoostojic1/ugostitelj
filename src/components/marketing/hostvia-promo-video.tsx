"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";

const VIDEO_SRC = "/videos/hostvia-promo.mp4";
const POSTER_SRC = "/videos/hostvia-promo-poster.jpg";

type Mode = "idle" | "preview" | "sound";

export function HostviaPromoVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("idle");

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (video.dataset.mode === "sound") return;
        if (entry.isIntersecting) {
          video.muted = true;
          video
            .play()
            .then(() => setMode("preview"))
            .catch(() => setMode("idle"));
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.dataset.mode = mode;
  }, [mode]);

  function playWithSound() {
    const video = videoRef.current;
    if (!video) return;
    video.dataset.mode = "sound";
    video.currentTime = 0;
    video.muted = false;
    video.loop = false;
    setMode("sound");
    void video.play().catch(() => setMode("idle"));
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-5xl">
      <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-1.5 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] sm:rounded-[1.9rem] sm:p-2.5">
        <div className="relative overflow-hidden rounded-[1.1rem] bg-[#06060a] ring-1 ring-black/60 sm:rounded-[1.35rem]">
          <video
            ref={videoRef}
            className="block aspect-video w-full"
            poster={POSTER_SRC}
            preload="none"
            playsInline
            muted
            loop
            controls={mode === "sound"}
            onEnded={() => setMode("idle")}
            aria-label="Hostvia.me product tour: calendars, manual bookings, cleanings, booking website and saved messages"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          {mode === "idle" ? (
            <button
              type="button"
              onClick={playWithSound}
              className="group absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/15"
              aria-label="Play video with sound"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-zinc-950 shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-8 ring-white/15 transition group-hover:scale-105 sm:h-20 sm:w-20">
                <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
              </span>
            </button>
          ) : null}

          {mode === "preview" ? (
            <button
              type="button"
              onClick={playWithSound}
              className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/75 sm:bottom-5 sm:left-5 sm:px-4 sm:text-sm"
            >
              <Volume2 className="h-4 w-4" />
              Play with sound
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
