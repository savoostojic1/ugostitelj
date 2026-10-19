"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDeleteManualReservation,
  useManualReservations,
  type ManualReservation,
} from "@/hooks/use-manual-reservations";
import { formatStayPeriodLabel } from "@/lib/dates/calendar-date";
import { formatPrice } from "@/lib/format/price";
import { toast } from "sonner";

function todayDateOnly(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Upcoming and in-house stays first (soonest check-in on top). Finished stays sink to the bottom, most recent first. */
function splitManualReservations(reservations: ManualReservation[]): {
  upcoming: ManualReservation[];
  past: ManualReservation[];
} {
  const today = todayDateOnly();
  const upcoming: ManualReservation[] = [];
  const past: ManualReservation[] = [];

  for (const reservation of reservations) {
    if (reservation.check_out <= today) past.push(reservation);
    else upcoming.push(reservation);
  }

  upcoming.sort((a, b) => a.check_in.localeCompare(b.check_in));
  past.sort((a, b) => b.check_out.localeCompare(a.check_out));

  return { upcoming, past };
}

function ReservationCard({
  reservation,
  muted = false,
  onDelete,
  deletePending,
}: {
  reservation: ManualReservation;
  muted?: boolean;
  onDelete: () => void;
  deletePending: boolean;
}) {
  return (
    <Card className={muted ? "opacity-60" : undefined}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{reservation.title}</p>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-300">
              {reservation.properties.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatStayPeriodLabel(reservation.check_in, reservation.check_out)}
          </p>
          <p className="text-sm text-muted-foreground">
            {reservation.source}
            {reservation.guest_phone && <> · {reservation.guest_phone}</>}
            {reservation.price != null && (
              <>
                {" "}
                ·{" "}
                <span className="font-medium text-foreground">
                  {formatPrice(reservation.price)}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-1 self-end sm:self-center">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/dashboard/manual-reservations/${reservation.id}/edit`}
              aria-label={`Edit ${reservation.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={deletePending}
            aria-label={`Delete ${reservation.title}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManualReservationsPage() {
  const { data: reservations = [], isLoading } = useManualReservations();
  const { upcoming: upcomingReservations, past: pastReservations } =
    splitManualReservations(reservations);
  const deleteReservation = useDeleteManualReservation();

  function handleDelete(id: string, guestName: string) {
    if (!confirm(`Delete manual reservation for ${guestName}?`)) return;

    deleteReservation.mutate(id, {
      onSuccess: () => toast.success("Reservation deleted"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Delete failed"),
    });
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Bookings"
        title="Manual bookings"
        description="Reservations you enter manually, outside Airbnb/Booking calendars"
        actions={
          <Button asChild>
            <Link href="/dashboard/manual-reservations/new">
              <Plus className="h-4 w-4" />
              New reservation
            </Link>
          </Button>
        }
      />

      {!isLoading && reservations.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <p className="mb-4 text-muted-foreground">
              No manual reservations yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/manual-reservations/new">
                Add first reservation
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {upcomingReservations.map((r) => (
          <ReservationCard
            key={r.id}
            reservation={r}
            onDelete={() => handleDelete(r.id, r.title)}
            deletePending={deleteReservation.isPending}
          />
        ))}

        {pastReservations.length > 0 ? (
          <div className="space-y-3 pt-6">
            <p className="text-xs text-zinc-500">Past</p>
            {pastReservations.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                muted
                onDelete={() => handleDelete(r.id, r.title)}
                deletePending={deleteReservation.isPending}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
