"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { PublicPropertyGallery } from "@/components/public/public-property-gallery";
import { appLocale } from "@/lib/dates/locale";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  HostSearchParams,
  PublicPropertySearchResult,
} from "@/lib/public/types";
import {
  formatEuro,
  nightsLabel,
  parseStartingPrice,
  resolveStayPriceQuote,
} from "@/lib/public/stay-price";

interface HostReservePanelProps {
  property: PublicPropertySearchResult;
  search: HostSearchParams;
  onBack: () => void;
}

export function HostReservePanel({
  property,
  search,
  onBack,
}: HostReservePanelProps) {
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inputClass =
    "public-input w-full border border-[var(--public-border)] bg-[var(--public-bg-subtle)] px-4 py-3 text-sm text-[var(--public-fg)] placeholder:text-[var(--public-muted-soft)]";

  const stayPrice = resolveStayPriceQuote(
    search.checkIn,
    search.checkOut,
    parseStartingPrice(property.starting_price),
    property.stay_total
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertySlug: property.slug,
          guestName,
          email,
          phone,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          guestCount: search.guests,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Error");
      }

      setSubmitted(true);
      toast.success("Request sent! The host will contact you.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="public-card public-animate-in flex flex-col items-center px-6 py-16 text-center md:px-12 md:py-20">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--public-success-soft)] text-[var(--public-success)]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="public-heading text-2xl md:text-3xl">Request sent</h3>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--public-muted)]">
          Thank you, {guestName}. The host will confirm availability for{" "}
          <strong className="font-semibold text-[var(--public-fg)]">
            {property.name}
          </strong>{" "}
          and reach out at {email}.
        </p>
      </div>
    );
  }

  return (
    <div className="public-animate-in grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
      <aside className="public-card overflow-hidden lg:sticky lg:top-8 lg:self-start">
        <PublicPropertyGallery
          name={property.name}
          imageUrl={property.image_url}
          galleryUrls={property.gallery_urls}
          variant="panel"
        />
        <div className="space-y-4 p-5 md:p-6">
          <div>
            <p className="public-label mb-2">Your stay</p>
            <h2 className="text-xl font-bold tracking-tight">{property.name}</h2>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3 text-[var(--public-muted)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--public-accent-soft)] text-[var(--public-accent)]">
                <CalendarRange className="h-4 w-4" />
              </span>
              <span>
                {format(parseISO(search.checkIn), "d. MMMM", { locale: appLocale })} –{" "}
                {format(parseISO(search.checkOut), "d. MMMM yyyy", {
                  locale: appLocale,
                })}
              </span>
            </li>
            <li className="flex items-center gap-3 text-[var(--public-muted)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--public-accent-soft)] text-[var(--public-accent)]">
                <Users className="h-4 w-4" />
              </span>
              <span>
                {search.guests}{" "}
                {search.guests === 1 ? "guest" : "guests"}
              </span>
            </li>
          </ul>
          {stayPrice ? (
            <div className="rounded-xl border border-[var(--public-border)] bg-[var(--public-bg-subtle)] p-4">
              <p className="public-label mb-2">Price</p>
              <p className="text-2xl font-bold tracking-tight">
                {formatEuro(stayPrice.total)}
              </p>
              <p className="mt-1 text-sm text-[var(--public-muted)]">
                total for {nightsLabel(stayPrice.nights)}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--public-accent)]">
                {formatEuro(stayPrice.pricePerNight)} per night
              </p>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="public-card overflow-hidden">
        <div className="border-b border-[var(--public-border)] px-5 py-5 md:px-8 md:py-6">
          <button
            type="button"
            onClick={onBack}
            className="public-btn public-btn-secondary mb-5 px-3 py-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h2 className="public-heading text-2xl md:text-3xl">
            Your details
          </h2>
          <p className="mt-2 text-sm text-[var(--public-muted)]">
            Leave your contact info — the host will reach out to confirm
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 md:p-8">
          <div className="space-y-2">
            <label htmlFor="reserve-name" className="public-label">
              Full name
            </label>
            <input
              id="reserve-name"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="reserve-email" className="public-label">
                Email
              </label>
              <input
                id="reserve-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@email.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reserve-phone" className="public-label">
                Phone
              </label>
              <input
                id="reserve-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reserve-message" className="public-label">
              Message <span className="font-normal normal-case">(optional)</span>
            </label>
            <textarea
              id="reserve-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Additional notes, questions about the stay…"
              className={cn(inputClass, "resize-none")}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="public-btn public-btn-primary w-full py-3.5"
          >
            {submitting ? "Sending…" : "Send request"}
            {!submitting && <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
