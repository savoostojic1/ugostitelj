"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, Globe, MousePointerClick, Palette, Search, Smartphone, Wallet } from "lucide-react";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PreviewFrame } from "@/components/website-builder/preview-frame";
import { WEBSITE_BUILDER_PATH } from "@/lib/website-builder/limits";
import { SAMPLE_SPECS, sampleWebsiteModel } from "@/lib/website-builder/sample-site";
import { WEBSITE_THEME_META } from "@/lib/website-builder/themes";
import type { WebsiteThemeId } from "@/lib/website-builder/types";
import { cn } from "@/lib/utils";
import "@/components/website-builder/builder.css";

const ROTATE_MS = 8000;

/** Slowly scrolls a preview canvas so the showcase feels alive; pauses while hovered. */
function useAutoTour(container: React.RefObject<HTMLDivElement | null>, key: string, paused: boolean) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let start = 0;
    const scrollers = () => Array.from(root.querySelectorAll<HTMLElement>("[data-wbx-canvas]"));
    scrollers().forEach((el) => el.scrollTo({ top: 0 }));
    const tick = (time: number) => {
      if (!start) start = time;
      const elapsed = time - start;
      if (!paused && elapsed > 900) {
        for (const el of scrollers()) {
          const max = el.scrollHeight - el.clientHeight;
          const t = Math.min(1, (elapsed - 900) / (ROTATE_MS - 1400));
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          el.scrollTop = Math.min(max * 0.55, max * 0.55 * eased);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [container, key, paused]);
}

function Showcase() {
  const [theme, setTheme] = useState<WebsiteThemeId>("luxe");
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const model = useMemo(() => sampleWebsiteModel(theme), [theme]);

  useEffect(() => {
    if (!auto || hover) return;
    const handle = window.setTimeout(() => {
      const index = WEBSITE_THEME_META.findIndex((item) => item.id === theme);
      setTheme(WEBSITE_THEME_META[(index + 1) % WEBSITE_THEME_META.length].id);
    }, ROTATE_MS);
    return () => window.clearTimeout(handle);
  }, [auto, hover, theme]);

  useAutoTour(stage, theme, hover || !auto);

  return (
    <div id="designs" className="scroll-mt-24">
      <div ref={stage} className="relative mx-auto max-w-[1240px]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div className="pointer-events-none absolute -inset-x-10 -top-16 bottom-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_30%,rgba(139,92,246,0.22),transparent_70%)]" aria-hidden />
        <div key={theme} className="relative h-[min(68vh,640px)] min-h-[380px] animate-[wbx-fade_0.6s_ease]">
          <PreviewFrame model={model} device="desktop" />
        </div>
        <div key={`${theme}-phone`} className="absolute -bottom-8 right-2 hidden h-[460px] w-[230px] animate-[wbx-rise_0.9s_cubic-bezier(0.16,1,0.3,1)_both] md:block lg:-right-8">
          <PreviewFrame model={model} device="mobile" />
        </div>
      </div>
      <div className="relative mx-auto mt-14 grid max-w-[1240px] grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="tablist" aria-label="Website designs">
        {WEBSITE_THEME_META.map((item) => {
          const selected = item.id === theme;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setTheme(item.id);
                setAuto(false);
              }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition",
                selected ? "border-white/25 bg-white/[0.07]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/15"
              )}
            >
              <span className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-white">{item.name}</span>
                <span className="flex gap-1">
                  {item.swatch.map((color) => (
                    <span key={color} className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20" style={{ background: color }} />
                  ))}
                </span>
              </span>
              <span className="mt-0.5 block text-[12.5px] text-zinc-400">{item.tagline}</span>
              <span className="mt-0.5 block truncate text-[11.5px] text-zinc-600">{SAMPLE_SPECS[item.id].name} · {SAMPLE_SPECS[item.id].location}</span>
              {selected && auto && !hover ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-violet-400 to-fuchsia-400" style={{ animation: `wbl-progress ${ROTATE_MS}ms linear both` }} />
              ) : selected ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-violet-400 to-fuchsia-400" />
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[13px] text-zinc-500">
        Every design is a real, scrollable website.{" "}
        <Link href={`${WEBSITE_BUILDER_PATH}/demo/${theme}`} className="inline-flex items-center gap-1 text-zinc-300 underline-offset-4 hover:text-white hover:underline">
          Open the full {WEBSITE_THEME_META.find((item) => item.id === theme)?.name} demo <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </p>
      <style>{`@keyframes wbl-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}

const INTEGRATION = [
  { icon: Wallet, title: "Live prices & currency", text: "Nightly rates come straight from your Hostvia property, in its own currency." },
  { icon: CalendarCheck, title: "Real availability", text: "Booked nights are blocked in the inquiry form. No double bookings from the website." },
  { icon: MousePointerClick, title: "Booking inquiries", text: "Guests send dates and details. You confirm in Hostvia, as you do today." },
  { icon: Search, title: "Search-ready pages", text: "Unique titles, descriptions, sitemap and lodging structured data on every page." },
  { icon: Smartphone, title: "Made for phones", text: "Each design has its own mobile layout, tested at real phone widths." },
  { icon: Globe, title: "Your own address", text: "Publish on your Hostvia address. Switch back to the simple booking page any time." },
];

export function WebsiteBuilderLanding({ faq }: { faq: { question: string; answer: string }[] }) {
  return (
    <div className="overflow-x-clip pb-10">
      {/* Hero */}
      <section className="relative px-4 pb-10 pt-6 md:px-8 md:pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="marketing-eyebrow">Free vacation rental website builder</p>
          <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl md:text-[5rem]">
            Your place,
            <br />
            <span className="bg-gradient-to-r from-violet-200 via-fuchsia-200 to-amber-100 bg-clip-text font-[family-name:var(--font-wb-luxe-serif)] font-normal italic tracking-[-0.02em] text-transparent">
              art-directed.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-zinc-300 md:text-lg">
            Create a website for your vacation rental that looks like a design agency made it. Choose one of five
            cinematic designs, add your photos and stays, and publish with live prices and booking inquiries. No coding.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={WEBSITE_BUILDER_PATH}
              className="hostvia-btn-gradient inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-[15px] font-semibold"
            >
              Create my free website
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href="#designs" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 text-[15px] font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.07]">
              See the five designs
            </a>
          </div>
          <p className="mt-4 text-[13px] text-zinc-500">Start without an account. Sign up only when you publish.</p>
        </div>
      </section>

      <section className="px-4 pb-20 pt-8 md:px-8">
        <Showcase />
      </section>

      {/* Designs strip */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-end">
            <div>
              <p className="marketing-eyebrow">Five designs</p>
              <h2 className="marketing-heading mt-3 text-3xl text-white md:text-[2.75rem] md:leading-[1.05]">Five websites, not five colour schemes.</h2>
            </div>
            <p className="text-[15px] leading-relaxed text-zinc-400 md:text-base">
              Each design has its own typography, composition, navigation and motion. Luxe settles slowly like a film,
              Coastal drifts, Nature builds depth, Minimal moves with precision, and Escape tells your place in chapters.
            </p>
          </div>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-5">
            {WEBSITE_THEME_META.map((theme, index) => (
              <li key={theme.id} className="group flex flex-col bg-[#09080d] p-6 transition hover:bg-[#0e0d13]">
                <span className="text-[12px] tabular-nums text-zinc-600">0{index + 1}</span>
                <span
                  className="mt-6 text-[2.4rem] leading-none text-white"
                  style={{
                    fontFamily: `var(--font-wb-${theme.id === "minimal" ? "minimal-sans" : `${theme.id}-serif`})`,
                    fontStyle: theme.id === "escape" || theme.id === "coastal" ? "italic" : "normal",
                    fontWeight: theme.id === "minimal" ? 600 : theme.id === "luxe" ? 300 : 400,
                    letterSpacing: theme.id === "minimal" ? "-0.05em" : undefined,
                  }}
                >
                  {theme.name}
                </span>
                <span className="mt-2 text-[13px] text-zinc-400">{theme.tagline}</span>
                <p className="mt-5 flex-1 text-[13px] leading-relaxed text-zinc-500">{theme.motion}.</p>
                <p className="mt-5 text-[12px] text-zinc-600">{theme.suitedFor}</p>
                <Link href={`${WEBSITE_BUILDER_PATH}/demo/${theme.id}`} className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-zinc-300 transition group-hover:text-white">
                  View demo <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <p className="marketing-eyebrow">How it works</p>
          <h2 className="marketing-heading mt-3 max-w-2xl text-3xl text-white md:text-[2.75rem] md:leading-[1.05]">From a blank page to a live website in one sitting.</h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              { icon: Palette, title: "Design", text: "Pick a design and watch your name, photos and stays appear in a live preview as you type." },
              { icon: MousePointerClick, title: "Refine", text: "Click any text on the page to rewrite it. Add, reorder or hide sections. Preview on phone and desktop." },
              { icon: Globe, title: "Publish", text: "Create a free account, connect your Hostvia properties, and go live with real prices and inquiries." },
            ].map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="relative border-t border-white/10 pt-6">
                <span className="absolute -top-px left-0 h-px w-16 bg-gradient-to-r from-violet-400 to-fuchsia-400" />
                <div className="flex items-center gap-3">
                  <span className="text-[13px] tabular-nums text-zinc-600">0{index + 1}</span>
                  <Icon className="h-4 w-4 text-violet-300" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Integration */}
      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1240px] gap-10 rounded-[2rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 md:grid-cols-[0.9fr_1.1fr] md:p-12">
          <div>
            <p className="marketing-eyebrow">Connected to Hostvia</p>
            <h2 className="marketing-heading mt-3 text-3xl text-white md:text-[2.4rem] md:leading-[1.08]">Beautiful on the outside. Your real business underneath.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
              The website is not a separate system. It reads your properties, prices and calendars from Hostvia and sends
              inquiries to the same inbox and notifications you already use.
            </p>
            <Link href={WEBSITE_BUILDER_PATH} className="hostvia-btn-gradient mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-[15px] font-semibold">
              Start building <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {INTEGRATION.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon className="h-5 w-5 text-violet-300" />
                <h3 className="mt-3 text-[15px] font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-400">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Included */}
      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-[1240px] text-center">
          <h2 className="marketing-heading text-3xl text-white md:text-[2.4rem]">A complete website, free.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] text-zinc-400">
            Every design, multiple pages, your photographs and a Hostvia address are included. Pro removes the footer credit and adds per-page search controls.
          </p>
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
            {["Five designs", "Multi-page websites", "Live nightly prices", "Booking inquiries", "Mobile layouts", "Search titles & sitemap", "Inline editing", "Start without signing up"].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13.5px] text-zinc-200">
                <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden /> {item}
              </li>
            ))}
          </ul>
          <Link href={WEBSITE_BUILDER_PATH} className="hostvia-btn-gradient mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-[15px] font-semibold">
            Create my free website <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="marketing-heading mb-6 text-3xl text-white">Questions</h2>
          <FaqAccordion items={faq} />
        </div>
      </section>
    </div>
  );
}
