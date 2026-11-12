import Link from "next/link";
import {
  ArrowRight,
  BellOff,
  Clock,
  Building2,
  KeyRound,
  MapPin,
  QrCode,
  ScrollText,
  Sparkles,
  Wifi,
} from "lucide-react";
import { THEME_DEFINITIONS } from "@/lib/guest-guide/themes";
import { GUEST_GUIDE_CREATE_PATH, GUEST_GUIDE_DEMO_PATH } from "@/lib/guest-guide/content";

const INSIDE = [
  { icon: KeyRound, label: "Check-in & check-out" },
  { icon: Wifi, label: "Wi-Fi details" },
  { icon: ScrollText, label: "House rules" },
  { icon: MapPin, label: "Local tips" },
];

const BENEFITS = [
  {
    icon: BellOff,
    title: "Fewer repeated questions",
    body: "Wi-Fi, parking and check-in answers are one tap away, so guests stop messaging you at midnight.",
  },
  {
    icon: QrCode,
    title: "One link and a QR code",
    body: "Send the link before arrival or print the QR code and leave it in the apartment.",
  },
  {
    icon: Clock,
    title: "Update it any time",
    body: "Change the door code or a recommendation once and every guest sees the new version.",
  },
];

export function GuestGuidesEmptyState() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/[0.12] via-white/[0.02] to-transparent">
        <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:p-10">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Free · nothing for guests to install
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              A digital welcome book your guests will actually read
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
              Put everything guests need for their stay on one beautiful page they open on their phone,
              from the door code to your favourite restaurant.
            </p>
            <ul className="mt-5 grid max-w-md grid-cols-2 gap-2">
              {INSIDE.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm text-zinc-300">
                  <item.icon className="h-4 w-4 shrink-0 text-violet-300" aria-hidden />
                  {item.label}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={GUEST_GUIDE_CREATE_PATH}
                className="hostvia-btn-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold"
              >
                Create my first guide
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={GUEST_GUIDE_DEMO_PATH}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/5"
              >
                See an example guide
              </Link>
            </div>
          </div>

          <PhoneMockup />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3" aria-label="Why a guest guide">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
              <benefit.icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-white">{benefit.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{benefit.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="guide-themes">
        <h3 id="guide-themes" className="hostvia-dashboard-eyebrow">Three designs to choose from</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {THEME_DEFINITIONS.map((theme) => (
            <li key={theme.id} className="overflow-hidden rounded-xl border border-white/10">
              <div
                className="flex h-20 items-end gap-1.5 p-3"
                style={{ background: `linear-gradient(135deg, ${theme.swatch[0]}, ${theme.swatch[1]})` }}
                aria-hidden
              >
                {theme.swatch.map((color) => (
                  <span key={color} className="h-4 w-4 rounded-full border border-black/10" style={{ background: color }} />
                ))}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white">{theme.name}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{theme.tagline}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <Building2 className="h-3.5 w-3.5" aria-hidden />
          Create as many guides as you like, one for each property.
        </p>
      </section>
    </div>
  );
}

/** A small, non-interactive picture of a guide on a phone, in the Signature Beige colours. */
function PhoneMockup() {
  const [paper, accent, ink] = THEME_DEFINITIONS[0].swatch;
  const rows = [
    { icon: KeyRound, title: "Check-in", detail: "From 15:00 · Code 4821" },
    { icon: Wifi, title: "Wi-Fi", detail: "Network VillaOlea" },
    { icon: ScrollText, title: "House rules", detail: "Quiet hours after 22:00" },
    { icon: MapPin, title: "Local tips", detail: "Konoba Bura · 5 min walk" },
  ];
  return (
    <div className="mx-auto w-full max-w-[260px]" aria-hidden>
      <div className="rounded-[2.2rem] border border-white/15 bg-zinc-950 p-2 shadow-2xl shadow-violet-950/40">
        <div className="overflow-hidden rounded-[1.8rem]" style={{ background: paper, color: ink }}>
          <div className="px-5 pb-4 pt-7" style={{ background: `linear-gradient(160deg, ${paper}, ${accent}55)` }}>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${ink}99` }}>Welcome to</p>
            <p className="mt-1 font-serif text-2xl leading-tight">Villa Olea</p>
            <p className="mt-1 text-[11px]" style={{ color: `${ink}b3` }}>Everything for a relaxed stay</p>
          </div>
          <ul className="space-y-2 px-3 pb-5 pt-3">
            {rows.map((row) => (
              <li key={row.title} className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${accent}33`, color: ink }}>
                  <row.icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold">{row.title}</span>
                  <span className="block truncate text-[10px]" style={{ color: `${ink}99` }}>{row.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
