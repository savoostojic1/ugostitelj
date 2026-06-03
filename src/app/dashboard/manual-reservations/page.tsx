"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDeleteManualReservation,
  useManualReservations,
} from "@/hooks/use-manual-reservations";
import { formatStayPeriodLabel } from "@/lib/dates/calendar-date";
import { formatPrice } from "@/lib/format/price";
import { toast } from "sonner";

export default function ManualReservationsPage() {
  const { data: reservations = [], isLoading } = useManualReservations();
  const deleteReservation = useDeleteManualReservation();

  function handleDelete(id: string, guestName: string) {
    if (!confirm(`Obriši ručnu rezervaciju za ${guestName}?`)) return;

    deleteReservation.mutate(id, {
      onSuccess: () => toast.success("Rezervacija obrisana"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Brisanje nije uspjelo"),
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ručne rezervacije
          </h1>
          <p className="text-muted-foreground">
            Rezervacije koje uneseš ručno, van Airbnb/Booking kalendara
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/manual-reservations/new">
            <Plus className="h-4 w-4" />
            Nova rezervacija
          </Link>
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Učitavanje…</p>
      )}

      {!isLoading && reservations.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <p className="mb-4 text-muted-foreground">
              Još nema ručnih rezervacija.
            </p>
            <Button asChild>
              <Link href="/dashboard/manual-reservations/new">
                Dodaj prvu rezervaciju
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reservations.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{r.title}</p>
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-300">
                    {r.properties.name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatStayPeriodLabel(r.check_in, r.check_out)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {r.source}
                  {r.price != null && (
                    <>
                      {" "}
                      · <span className="font-medium text-foreground">{formatPrice(r.price)}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 gap-1 self-end sm:self-center">
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href={`/dashboard/manual-reservations/${r.id}/edit`}
                    aria-label={`Uredi ${r.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(r.id, r.title)}
                  disabled={deleteReservation.isPending}
                  aria-label={`Obriši ${r.title}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
