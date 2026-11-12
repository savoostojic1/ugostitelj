import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Palette,
  Percent,
  Rocket,
  Smartphone,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { THEME_PHOTOS } from "@/lib/website-builder/photo-library";
import { WEBSITE_THEME_META } from "@/lib/website-builder/themes";
import { WEBSITE_BUILDER_PATH } from "@/lib/website-builder/limits";

/** Thumbnail-sized version of a curated Unsplash photo. */
function small(url: string, width: number): string {
  return url.replace(/([?&])w=\d+/, `$1w=${width}`);
}

const STEPS = [
  {
    icon: Palette,
    title: "Pick a design",
    body: "Five themes made for villas, apartments, cabins and boutique stays.",
  },
  {
    icon: WandSparkles,
    title: "Let AI write it",
    body: "Paste your Booking or Airbnb description and add your photos. AI fills every page.",
  },
  {
    icon: Rocket,
    title: "Publish",
    body: "Go live on your Hostvia address and share the link with guests.",
  },
];

const BENEFITS = [
  {
    icon: Percent,
    title: "Direct bookings, no commission",
    body: "Guests send booking requests straight to you instead of through a platform.",
  },
  {
    icon: CalendarCheck,
    title: "Prices and calendar stay in sync",
    body: "Stays connect to your Hostvia properties, so availability is always current.",
  },
  {
    icon: Smartphone,
    title: "Looks right on every phone",
    body: "Every theme is responsive and ready for search engines out of the box.",
  },
];

export function WebsiteEmptyState() {
  const hero = THEME_PHOTOS.luxe[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/[0.12] via-white/[0.02] to-transparent">
        <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:p-10">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Free · built with AI in minutes
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your own website for direct bookings
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
              Show your place the way it deserves, with your photos, your story and a booking request form.
              Guests book with you directly, without platform fees.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={WEBSITE_BUILDER_PATH}
                className="hostvia-btn-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold"
              >
                Create my website
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={`${WEBSITE_BUILDER_PATH}/demo/luxe`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/5"
              >
                See an example
              </Link>
            </div>
            <p className="mt-4 text-xs text-zinc-500">No design skills or credit card needed. Publish only when you are happy with it.</p>
          </div>

          <BrowserMockup image={small(hero.url, 1100)} alt={hero.alt} />
        </div>
      </section>

      <section aria-labelledby="website-steps">
        <h3 id="website-steps" className="hostvia-dashboard-eyebrow">How it works</h3>
        <ol className="mt-3 grid gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
                  <step.icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm font-medium text-white">
                  <span className="text-zinc-500">{index + 1}. </span>
                  {step.title}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="website-themes">
        <div className="flex items-end justify-between gap-4">
          <h3 id="website-themes" className="hostvia-dashboard-eyebrow">Choose from five designs</h3>
          <p className="hidden text-xs text-zinc-500 sm:block">Open one to see a full example site</p>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {WEBSITE_THEME_META.map((theme) => {
            const photo = THEME_PHOTOS[theme.id][0];
            return (
              <li key={theme.id}>
                <Link
                  href={`${WEBSITE_BUILDER_PATH}/demo/${theme.id}`}
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition hover:border-violet-400/40"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={small(photo.url, 480)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white">{theme.name}</p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{theme.tagline}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3 md:grid-cols-3" aria-label="Why a website">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="flex gap-3 rounded-xl border border-white/10 p-4">
            <benefit.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
            <div>
              <p className="text-sm font-medium text-white">{benefit.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{benefit.body}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

/** A small, non-interactive picture of a finished site. */
function BrowserMockup({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
      <div className="overflow-hidden rounded-xl border border-white/15 bg-zinc-950 shadow-2xl shadow-violet-950/40">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-2 truncate rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">yourplace.hostvia.me</span>
        </div>
        <div className="relative aspect-[16/11]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-white/85">
            <span className="font-serif text-xs normal-case tracking-normal">Villa Olea</span>
            <span className="hidden sm:inline">Stays · Gallery · Contact</span>
          </div>
          <div className="absolute inset-x-4 bottom-4">
            <p className="font-serif text-2xl leading-tight text-white sm:text-3xl">Quiet days by the sea</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/95 p-1.5 text-[10px] text-zinc-700">
              <span className="flex-1 truncate px-1.5">Check in · Check out</span>
              <span className="hidden flex-1 truncate border-l border-zinc-200 px-1.5 sm:block">2 guests</span>
              <span className="rounded-md bg-zinc-900 px-2.5 py-1.5 font-medium text-white">Check availability</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
