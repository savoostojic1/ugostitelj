"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { GuestGuideLiveDemo } from "@/components/guest-guide/landing/live-demo";
import { HostviaToolCta } from "@/components/tools/hostvia-tool-cta";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import {
  GUEST_GUIDE_BENEFITS,
  GUEST_GUIDE_CREATE_PATH,
  GUEST_GUIDE_DESCRIPTION,
  GUEST_GUIDE_FAQ,
  GUEST_GUIDE_FREE_LINE,
  GUEST_GUIDE_INTRO,
  GUEST_GUIDE_TITLE,
} from "@/lib/guest-guide/content";
import { THEME_DEFINITIONS } from "@/lib/guest-guide/themes";
import type { GuestGuideTheme } from "@/lib/guest-guide/types";
import { trackHostviaEvent, trackOncePerSession } from "@/lib/analytics/track";

export function GuestGuideLandingPage() {
  const [theme, setTheme] = useState<GuestGuideTheme>("signature-beige");

  useEffect(() => {
    trackOncePerSession("guest_guide_landing_view");
  }, []);

  return (
    <div className="pb-8">
      <section className="relative px-4 pb-12 pt-4 md:px-8 md:pb-16 md:pt-6">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-[5%] top-[8%] h-[320px] w-[320px] rounded-full bg-amber-500/10 blur-[100px]" />
          <div className="absolute right-[8%] top-[18%] h-[280px] w-[280px] rounded-full bg-emerald-500/10 blur-[90px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="marketing-eyebrow">Hostvia Guest Guide</p>
            <h1 className="marketing-heading mt-4 max-w-xl text-4xl text-white md:text-5xl lg:text-[3.35rem]">
              {GUEST_GUIDE_TITLE}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-300">
              {GUEST_GUIDE_INTRO}
            </p>
            <p className="mt-4 inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-200">
              {GUEST_GUIDE_FREE_LINE}
            </p>
            <div className="marketing-cta-row mt-8">
              <Link
                href={GUEST_GUIDE_CREATE_PATH}
                onClick={() =>
                  trackHostviaEvent("guest_guide_builder_start", {
                    location: "landing_hero",
                  })
                }
                className="hostvia-btn-gradient inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold"
              >
                CREATE YOUR FREE GUIDE
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#live-preview"
                onClick={() =>
                  trackHostviaEvent("guest_guide_preview_open", {
                    location: "landing_hero",
                  })
                }
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.07]"
              >
                EXPLORE LIVE PREVIEW
              </a>
            </div>
            <p className="mt-5 max-w-md text-sm text-zinc-500">
              Free vacation rental guest guide generator — start without
              registering. Publish when you are ready.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              {/* Hero visual uses the same guide cover composition */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80"
                alt="Mediterranean villa terrace overlooking the sea — sample guest guide cover"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-5 sm:p-6">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-100/90">
                  Sample guide
                </p>
                <p className="mt-1 font-[family-name:var(--font-gg-serif)] text-3xl text-white">
                  Villa Oliva
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  Lustica Peninsula, Montenegro
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="live-preview"
        className="scroll-mt-24 px-4 py-12 md:px-8 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <GuestGuideLiveDemo theme={theme} onThemeChange={setTheme} />
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="marketing-eyebrow">Designs</p>
          <h2 className="marketing-heading mt-3 text-3xl text-white md:text-4xl">
            Three premium looks. All free.
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Each theme has its own typography, photography treatment and
            atmosphere — not just a background color swap.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {THEME_DEFINITIONS.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <span className="mb-3 flex gap-1.5" aria-hidden>
                  {item.swatch.map((color) => (
                    <span
                      key={color}
                      className="h-4 w-4 rounded-full border border-white/15"
                      style={{ background: color }}
                    />
                  ))}
                </span>
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="marketing-eyebrow">How it works</p>
          <h2 className="marketing-heading mt-3 text-3xl text-white">
            From blank page to guest-ready link
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "CREATE",
                text: "Add your property details, photos and guest information.",
              },
              {
                step: "02",
                title: "CUSTOMIZE",
                text: "Choose your design and make your guide truly yours.",
              },
              {
                step: "03",
                title: "SHARE",
                text: "Get your personal link and QR code. Share it with every guest.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6"
              >
                <p className="font-[family-name:var(--font-gg-serif)] text-4xl text-amber-200/80">
                  {item.step}
                </p>
                <h3 className="mt-3 text-sm font-semibold tracking-[0.14em] text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-6 py-10 md:px-10 md:py-12">
          <h2 className="marketing-heading text-3xl text-white md:text-4xl">
            Premium Look. Zero Cost.
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">{GUEST_GUIDE_DESCRIPTION}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GUEST_GUIDE_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-sm text-zinc-200"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
                  aria-hidden
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="marketing-heading text-3xl text-white">
            Free Airbnb welcome book FAQ
          </h2>
          <div className="mt-6">
            <FaqAccordion items={GUEST_GUIDE_FAQ} />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 md:pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="marketing-heading text-3xl text-white md:text-4xl">
            Give Your Guests a Better Experience.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Create a digital welcome book for Airbnb and vacation rentals in
            minutes — then share one elegant link.
          </p>
          <Link
            href={GUEST_GUIDE_CREATE_PATH}
            onClick={() =>
              trackHostviaEvent("guest_guide_builder_start", {
                location: "landing_final_cta",
              })
            }
            className="hostvia-btn-gradient mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold"
          >
            CREATE MY FREE GUEST GUIDE
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <HostviaToolCta
          tool="guest_guide_generator"
          title="Already managing rentals? Keep calendars and guest guides together."
          description="Hostvia helps small hosts sync calendars, plan arrivals and cleanings, publish a booking site — and now create free digital guest guides."
        />
      </div>
    </div>
  );
}
