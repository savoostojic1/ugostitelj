"use client";

import { useState } from "react";
import type { GuestReservationView } from "@/lib/reservations/guest-access";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  declined: "bg-rose-50 text-rose-800 ring-rose-200",
};

export function ManageReservation({
  token,
  view,
}: {
  token: string;
  view: Extract<GuestReservationView, { state: "active" }>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelledAt, setCancelledAt] = useState<string | null>(
    view.cancelledAtLabel
  );
  const [justCancelled, setJustCancelled] = useState(false);

  async function confirmCancel() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/reservation/manage/${encodeURIComponent(token)}/cancel`,
        { method: "POST" }
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        cancelledAt?: string | null;
      } | null;

      if (!response.ok || !body?.ok) {
        setError(body?.error || "Could not cancel this reservation.");
        return;
      }

      setJustCancelled(true);
      setOpen(false);
      if (body.cancelledAt) {
        setCancelledAt(
          new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
            hourCycle: "h23",
          }).format(new Date(body.cancelledAt))
        );
      }
    } catch {
      setError("Could not cancel this reservation. Your stay was not changed.");
    } finally {
      setBusy(false);
    }
  }

  const status = justCancelled ? "cancelled" : view.status;
  const title = justCancelled ? "Reservation cancelled" : view.title;
  const message = justCancelled
    ? `You cancelled this stay${cancelledAt ? ` on ${cancelledAt}` : ""}.`
    : view.message;
  const nextStep = justCancelled
    ? "The property owner has been notified. The dates are released on the property calendar. Hostvia does not process refunds."
    : view.nextStep;

  return (
    <article className="public-card overflow-hidden">
      <div className="border-b border-[var(--public-border)] px-5 py-6 md:px-8">
        <p className="public-label">Manage reservation</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS_TONE[status] ?? STATUS_TONE.pending}`}
          >
            {title}
          </span>
          {view.reference ? (
            <span className="text-xs font-medium text-[var(--public-muted)]" translate="no">
              {view.reference}
            </span>
          ) : null}
        </div>
        <h1 className="public-heading mt-4 text-3xl">{view.propertyName}</h1>
        {view.propertyAddress ? (
          <p className="mt-2 text-sm text-[var(--public-muted)]" translate="no">
            {view.propertyAddress}
          </p>
        ) : null}
      </div>

      <div className="space-y-6 px-5 py-6 md:px-8">
        <p className="text-[15px] leading-relaxed text-[var(--public-fg)]">{message}</p>
        <p className="text-sm leading-relaxed text-[var(--public-muted)]">{nextStep}</p>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="public-label">Check-in</dt>
            <dd className="mt-1 text-base font-semibold" translate="no">
              {view.checkInLabel}
            </dd>
          </div>
          <div>
            <dt className="public-label">Check-out</dt>
            <dd className="mt-1 text-base font-semibold" translate="no">
              {view.checkOutLabel}
            </dd>
          </div>
          <div>
            <dt className="public-label">Guests</dt>
            <dd className="mt-1 text-base font-semibold">{view.guestCountLabel}</dd>
          </div>
          <div>
            <dt className="public-label">Guest</dt>
            <dd className="mt-1 text-base font-semibold" translate="no">
              {view.guestName}
            </dd>
          </div>
        </dl>

        {view.hostName || view.hostEmail || view.hostPhone ? (
          <section className="rounded-2xl bg-[var(--public-bg-subtle)] p-4">
            <p className="public-label">Property contact</p>
            {view.hostName ? (
              <p className="mt-2 font-semibold" translate="no">
                {view.hostName}
              </p>
            ) : null}
            {view.hostEmail ? (
              <a
                className="mt-1 block text-sm text-[var(--public-accent)]"
                href={`mailto:${view.hostEmail}`}
                translate="no"
              >
                {view.hostEmail}
              </a>
            ) : null}
            {view.hostPhone ? (
              <a
                className="mt-1 block text-sm text-[var(--public-accent)]"
                href={`tel:${view.hostPhone}`}
                translate="no"
              >
                {view.hostPhone}
              </a>
            ) : null}
          </section>
        ) : null}

        {view.houseRules ? (
          <section>
            <p className="public-label">Check-in information</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--public-muted)]">
              {view.houseRules}
            </p>
          </section>
        ) : null}

        {view.canCancel && !justCancelled ? (
          <div>
            <button
              type="button"
              className="public-btn border border-rose-200 bg-white px-4 py-3 text-rose-700"
              onClick={() => {
                setError(null);
                setOpen(true);
              }}
            >
              Cancel reservation
            </button>
          </div>
        ) : null}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => {
            if (!busy) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-reservation-title"
            className="public-card w-full max-w-md p-5 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="cancel-reservation-title" className="text-xl font-semibold">
              Cancel this reservation?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--public-muted)]">
              This cancellation is final. The property owner will be notified
              and the dates will be released. Hostvia does not issue a refund.
            </p>
            {error ? (
              <p className="mt-3 text-sm text-rose-700" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="public-btn public-btn-secondary px-4 py-3"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Keep reservation
              </button>
              <button
                type="button"
                className="public-btn bg-rose-700 px-4 py-3 text-white disabled:opacity-60"
                disabled={busy}
                onClick={() => void confirmCancel()}
              >
                {busy ? "Cancelling…" : "Cancel reservation"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
