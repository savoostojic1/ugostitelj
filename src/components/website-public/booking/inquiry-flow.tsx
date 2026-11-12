"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RangeCalendar } from "@/components/website-public/booking/range-calendar";
import { formatDay, useBooking, useStayQuote } from "@/components/website-public/booking/booking-context";
import { Photo, priceLabel } from "@/components/website-public/primitives";
import { formatPropertyPrice } from "@/lib/currency/format";
import { validatePublicStayRange } from "@/lib/public/availability";
import { resolvePublicApiUrl } from "@/lib/public/browser-origin";
import { guestBookingRequestErrorMessage, parseJsonResponse } from "@/lib/public/parse-json-response";
import { nightsLabel } from "@/lib/public/stay-price";
import { bookingInquiryPayload } from "@/lib/website-builder/booking";

function safeReference(value: unknown): string | null {
  return typeof value === "string" && /^HV-[A-Z0-9]{6,12}$/.test(value) ? value : null;
}

function safeManageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.pathname.startsWith("/reservation/manage/") ? url.toString() : null;
  } catch {
    return null;
  }
}

export function GuestStepper({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="wb-stepper">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Fewer guests">
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="More guests">
        +
      </button>
    </div>
  );
}

type Step = "dates" | "details" | "sent";

/**
 * The guest inquiry: dates and guests with live availability and price, then
 * contact details, sent to Hostvia's booking request endpoint. Used inline in the
 * booking section and inside the sheet opened from the hero bar.
 */
export function InquiryFlow({ compact }: { compact?: boolean }) {
  const booking = useBooking();
  const [step, setStep] = useState<Step>("dates");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string | null; manageUrl: string | null; emailSent: boolean } | null>(null);

  const stay = booking?.stay ?? null;
  const { quote, loading } = useStayQuote(stay, booking?.checkIn ?? "", booking?.checkOut ?? "", booking?.preview ?? true);

  // Jump straight to details when dates were already chosen in the hero bar.
  useEffect(() => {
    if (booking?.sheetOpen && booking.checkIn && booking.checkOut && step === "dates" && compact) setStep("details");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.sheetOpen]);

  if (!booking || !stay) {
    // Builder preview: explain to the host. Live site: a calm note for guests.
    if (booking?.pending) {
      return (
        <div className="wb-inq wb-inq-empty" data-compact={compact ? "1" : undefined} role="note">
          <span className="wb-inq-pending-icon" aria-hidden />
          <p className="wb-kicker">Booking inquiries</p>
          <h3 className="wb-h3">Your stays come from your Hostvia properties.</h3>
          <p className="wb-body">
            Add your accommodation in Hostvia, with its price and calendar, and it appears here automatically, like on your booking site. Guests then choose dates with live availability and send you an inquiry.
          </p>
          <p className="wb-inq-fine">Only you see this note. It is not shown on your published website.</p>
        </div>
      );
    }
    return (
      <div className="wb-inq wb-inq-empty" data-compact={compact ? "1" : undefined}>
        <p className="wb-kicker">Booking inquiry</p>
        <h3 className="wb-h3">Online inquiries open soon.</h3>
        <p className="wb-body">In the meantime, please write to the host using the contact details on this website.</p>
      </div>
    );
  }

  const range = validatePublicStayRange(booking.reservations, booking.checkIn, booking.checkOut);
  const datesReady = range.ok;
  const max = stay.capacity ?? 30;
  const nightly = priceLabel(stay);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!booking || !stay?.propertySlug || !booking.canSend) return;
    if (!range.ok) {
      setError(range.message);
      setStep("dates");
      return;
    }
    setSending(true);
    setError(null);
    const endpoint = resolvePublicApiUrl("/api/booking-requests");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          bookingInquiryPayload({
            propertySlug: stay.propertySlug,
            guestName: name,
            email,
            phone,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            guestCount: booking.guests,
            message,
          })
        ),
      });
      const parsed = await parseJsonResponse<{ ok?: boolean; id?: unknown; reference?: unknown; manageUrl?: unknown; emailSent?: unknown; error?: unknown }>(response, { endpoint });
      if (!parsed.ok || !response.ok || parsed.data.ok === false || !parsed.data.id) {
        setError(guestBookingRequestErrorMessage(parsed, response.ok));
        return;
      }
      setResult({
        reference: safeReference(parsed.data.reference),
        manageUrl: safeManageUrl(parsed.data.manageUrl),
        emailSent: parsed.data.emailSent === true,
      });
      setStep("sent");
    } catch {
      setError("The inquiry could not be sent. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  const summary = (
    <div className="wb-inq-summary">
      {stay.photos[0] ? <Photo src={stay.photos[0].url} alt={stay.photos[0].alt || stay.name} className="wb-inq-thumb" sizes="160px" /> : null}
      <div>
        <p className="wb-inq-stay">{stay.name}</p>
        <p className="wb-inq-meta">
          {booking.checkIn ? `${formatDay(booking.checkIn, booking.language)} – ${formatDay(booking.checkOut, booking.language, true) || "…"}` : "Choose dates"}
          {" · "}
          {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
        </p>
      </div>
    </div>
  );

  if (step === "sent" && result) {
    return (
      <div className="wb-inq wb-inq-sent" role="status">
        <span className="wb-inq-check" aria-hidden />
        <p className="wb-kicker">Inquiry sent</p>
        <h3 className="wb-h3">Thank you, {name.split(" ")[0] || "and welcome"}.</h3>
        <p className="wb-body">
          Your request for {stay.name} is with the host. It is not a confirmed reservation yet; the host replies to confirm availability.
        </p>
        {result.reference ? (
          <p className="wb-inq-ref">
            Reference <strong translate="no">{result.reference}</strong>
          </p>
        ) : null}
        <p className="wb-inq-note">
          {result.emailSent ? "A copy is on its way to your email." : "Your request is saved. If no email arrives, use the link below or contact the host."}
        </p>
        {result.manageUrl ? (
          <a className="wb-btn" href={result.manageUrl}>
            Manage your request <span className="wb-btn-arrow" aria-hidden />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="wb-inq" data-compact={compact ? "1" : undefined}>
      <div className="wb-inq-top">
        <p className="wb-kicker">Inquiry, not a confirmed reservation</p>
        <ol className="wb-inq-steps" aria-label="Steps">
          <li data-on={step === "dates" ? "1" : "0"}>1 · Dates</li>
          <li data-on={step === "details" ? "1" : "0"}>2 · Your details</li>
        </ol>
      </div>

      {step === "dates" ? (
        <>
          {booking.stays.length > 1 ? (
            <div className="wb-inq-stays" role="radiogroup" aria-label="Accommodation">
              {booking.stays.map((item) => (
                <button key={item.id} type="button" role="radio" aria-checked={item.id === stay.id} onClick={() => booking.setStay(item.id)} data-on={item.id === stay.id ? "1" : "0"}>
                  <span>{item.name}</span>
                  <small>{priceLabel(item) ? `${priceLabel(item)} / night` : item.kindLabel}</small>
                </button>
              ))}
            </div>
          ) : null}
          <RangeCalendar checkIn={booking.checkIn} checkOut={booking.checkOut} reservations={booking.reservations} language={booking.language} onChange={booking.setDates} />
          <div className="wb-inq-row">
            <div className="wb-inq-field">
              <span>Guests{stay.capacity ? ` · up to ${stay.capacity}` : ""}</span>
              <GuestStepper value={booking.guests} max={max} onChange={booking.setGuests} />
            </div>
            <div className="wb-inq-total" aria-live="polite">
              {quote ? (
                <>
                  <span>{nightsLabel(quote.nights)}{loading ? " · updating" : ""}</span>
                  <strong>{formatPropertyPrice(quote.total, stay.currencyCode)}</strong>
                  <small>
                    {formatPropertyPrice(quote.pricePerNight, stay.currencyCode)} / night{quote.usesDatePricing ? " on average" : ""}
                  </small>
                </>
              ) : nightly ? (
                <>
                  <span>From</span>
                  <strong>{nightly}</strong>
                  <small>per night</small>
                </>
              ) : (
                <>
                  <span>Price</span>
                  <strong>On request</strong>
                </>
              )}
            </div>
          </div>
          {!range.ok && booking.checkIn && booking.checkOut ? <p className="wb-inq-error" role="alert">{range.message}</p> : null}
          <button type="button" className="wb-btn wb-inq-go" disabled={!datesReady} onClick={() => setStep("details")}>
            Continue <span className="wb-btn-arrow" aria-hidden />
          </button>
        </>
      ) : (
        <form className="wb-inq-form" onSubmit={submit}>
          {summary}
          <button type="button" className="wb-inq-back" onClick={() => setStep("dates")}>
            ← Change dates or guests
          </button>
          <label>
            Full name
            <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
          </label>
          <div className="wb-inq-two">
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label>
              Phone
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel" />
            </label>
          </div>
          <label>
            Message <small>optional</small>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Arrival time, questions, anything the host should know" />
          </label>
          {quote ? (
            <p className="wb-inq-line">
              <span>{nightsLabel(quote.nights)}</span>
              <strong>{formatPropertyPrice(quote.total, stay.currencyCode)}</strong>
            </p>
          ) : null}
          {error ? <p className="wb-inq-error" role="alert">{error}</p> : null}
          {booking.canSend ? (
            <button type="submit" className="wb-btn wb-inq-go" disabled={sending}>
              {sending ? "Sending…" : "Send inquiry"} <span className="wb-btn-arrow" aria-hidden />
            </button>
          ) : (
            <p className="wb-inq-note">
              {booking.preview ? "Preview. Guests send this inquiry from your published website once it is published." : "This stay is not yet open for inquiries."}
            </p>
          )}
          <p className="wb-inq-fine">No payment is taken. The host confirms availability before anything is reserved.</p>
        </form>
      )}
    </div>
  );
}

/** Full-height panel for the inquiry, opened from the hero bar and the Reserve buttons. */
export function BookingSheet({ themeClass, style }: { themeClass: string; style: React.CSSProperties }) {
  const booking = useBooking();
  const open = Boolean(booking?.sheetOpen);
  const close = booking?.close;

  useEffect(() => {
    if (!open || !close) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const preview = booking?.preview;
    const previous = document.body.style.overflow;
    if (!preview) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [booking?.preview, close, open]);

  if (!open || !booking) return null;
  const sheet = (
    <div className={`wb-sheet-root ${themeClass}`} style={style}>
      <div className="wb-sheet-scrim" onClick={booking.close} aria-hidden />
      <aside className="wb-sheet" role="dialog" aria-modal="true" aria-label="Booking inquiry">
        <button type="button" className="wb-sheet-close" onClick={booking.close} aria-label="Close">
          ×
        </button>
        <InquiryFlow compact />
      </aside>
    </div>
  );
  // On the live site the sheet covers the window; inside the builder it stays in the preview.
  if (booking.preview) return sheet;
  return createPortal(sheet, document.body);
}
