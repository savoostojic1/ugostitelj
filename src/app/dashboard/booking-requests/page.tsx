"use client";

import { format, parseISO } from "date-fns";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useBookingRequests,
  useUpdateBookingRequestStatus,
} from "@/hooks/use-booking-requests";
import type { BookingRequestStatus } from "@/types/database";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_LABELS: Record<BookingRequestStatus, string> = {
  pending: "Na čekanju",
  accepted: "Prihvaćeno",
  rejected: "Odbijeno",
  contacted: "Kontaktirano",
};

const STATUS_VARIANT: Record<
  BookingRequestStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  contacted: "outline",
};

export default function BookingRequestsPage() {
  const { data: requests = [], isLoading } = useBookingRequests();
  const updateStatus = useUpdateBookingRequestStatus();

  function setStatus(id: string, status: BookingRequestStatus) {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success("Status ažuriran"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Greška"),
      }
    );
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Booking upiti
        </h1>
        <p className="text-muted-foreground">
          Zahtjevi gostiju sa javnog sajta
          {pendingCount > 0 ? ` · ${pendingCount} novih` : ""}
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Učitavanje…</p>
      )}

      {!isLoading && requests.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            Još nema booking upita. Objavite javni sajt i smještaj da biste
            primali upite.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{request.guest_name}</p>
                  <Badge variant={STATUS_VARIANT[request.status]}>
                    {STATUS_LABELS[request.status]}
                  </Badge>
                </div>
                <p className="text-sm font-medium">
                  {request.properties?.name ?? "Smještaj"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(request.check_in), "d. MMM yyyy")} –{" "}
                  {format(parseISO(request.check_out), "d. MMM yyyy")} ·{" "}
                  {request.guest_count}{" "}
                  {request.guest_count === 1 ? "gost" : "gostiju"}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <a
                    href={`mailto:${request.email}`}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {request.email}
                  </a>
                  <a
                    href={`tel:${request.phone}`}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {request.phone}
                  </a>
                </div>
                {request.message ? (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm">
                    {request.message}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(request.created_at), "d. MMM yyyy, HH:mm")}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {(
                  [
                    ["accepted", "Prihvati"],
                    ["contacted", "Kontaktirano"],
                    ["rejected", "Odbij"],
                  ] as const
                ).map(([status, label]) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={request.status === status ? "default" : "outline"}
                    className={cn(
                      status === "rejected" &&
                        request.status !== status &&
                        "text-destructive"
                    )}
                    disabled={updateStatus.isPending}
                    onClick={() => setStatus(request.id, status)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
