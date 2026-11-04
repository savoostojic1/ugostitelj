"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { appLocale } from "@/lib/dates/locale";
import { Check, Mail, Phone, X } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PushNotificationsPrompt } from "@/components/pwa/push-notifications-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useAcceptBookingRequest,
  useBookingRequestHistory,
  useBookingRequests,
  useRejectBookingRequest,
} from "@/hooks/use-booking-requests";
import { toast } from "sonner";

export default function BookingRequestsPage() {
  const router = useRouter();
  const { data: requests = [], isLoading } = useBookingRequests();
  const { data: history = [] } = useBookingRequestHistory();
  const acceptRequest = useAcceptBookingRequest();
  const rejectRequest = useRejectBookingRequest();

  const isPending = acceptRequest.isPending || rejectRequest.isPending;
  const pendingCount = requests.length;

  function handleAccept(id: string, guestName: string) {
    acceptRequest.mutate(id, {
      onSuccess: (result) => {
        const description =
          result.guestEmail === "sent" || result.guestEmail === "duplicate"
            ? "The calendar was updated and the guest was emailed a confirmation. This is not a payment receipt."
            : result.guestEmail === "failed"
              ? "The calendar was updated. The confirmation email could not be sent and will be retried."
              : "The calendar was updated with this stay.";
        toast.success(`${guestName} added to manual bookings`, {
          description,
          action: {
            label: "View bookings",
            onClick: () => router.push("/dashboard/manual-reservations"),
          },
        });
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not accept"),
    });
  }

  function handleReject(id: string, guestName: string) {
    if (
      !confirm(
        `Decline the request from ${guestName}? It will leave your inbox. The guest can see that it was not confirmed.`
      )
    ) {
      return;
    }

    rejectRequest.mutate(id, {
      onSuccess: () => toast.success("Inquiry rejected"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not reject"),
    });
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Bookings"
        title="Booking inquiries"
        description={
          pendingCount > 0
            ? `${pendingCount} pending ${pendingCount === 1 ? "inquiry" : "inquiries"} from your booking site`
            : "Guest requests from your booking site"
        }
      />

      {!isLoading && requests.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            No pending inquiries. When a guest submits a request, you can accept
            it to add a manual booking or reject it to dismiss.
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
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <p className="text-sm font-medium">
                  {request.properties?.name ?? "Listing"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span translate="no">
                    {`${format(parseISO(request.check_in), "d MMM yyyy", {
                      locale: appLocale,
                    })} – ${format(parseISO(request.check_out), "d MMM yyyy", {
                      locale: appLocale,
                    })}`}
                  </span>
                  <span>
                    {` · ${request.guest_count} ${request.guest_count === 1 ? "guest" : "guests"}`}
                  </span>
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <a
                    href={`mailto:${request.email}`}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span translate="no">{request.email}</span>
                  </a>
                  <a
                    href={`tel:${request.phone}`}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span translate="no">{request.phone}</span>
                  </a>
                </div>
                {request.message ? (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
                    {request.message}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  <span>Received </span>
                  <span translate="no">
                    {format(parseISO(request.created_at), "d MMM yyyy, HH:mm", {
                      locale: appLocale,
                    })}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleAccept(request.id, request.guest_name)}
                >
                  <Check className="h-4 w-4" />
                  <span>Accept</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={() => handleReject(request.id, request.guest_name)}
                >
                  <X className="h-4 w-4" />
                  <span>Reject</span>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link
                    href={`/dashboard/properties/${request.property_id}/calendar`}
                  >
                    View calendar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {history.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">
            Recent declines and cancellations
          </h2>
          <div className="space-y-3">
            {history.map((request) => {
              const property = Array.isArray(request.properties)
                ? request.properties[0]
                : request.properties;
              const label =
                request.status === "rejected"
                  ? "Declined"
                  : request.cancelled_by === "guest"
                    ? "Cancelled by guest"
                    : request.cancelled_by === "owner"
                      ? "Cancelled by you"
                      : "Cancelled";
              return (
                <Card key={request.id}>
                  <CardContent className="space-y-1 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{request.guest_name}</p>
                      <Badge variant="secondary">{label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {property?.name ?? "Listing"}
                      {" · "}
                      <span translate="no">
                        {`${format(parseISO(request.check_in), "d MMM yyyy", {
                          locale: appLocale,
                        })} – ${format(parseISO(request.check_out), "d MMM yyyy", {
                          locale: appLocale,
                        })}`}
                      </span>
                      {` · ${request.guest_count} ${request.guest_count === 1 ? "guest" : "guests"}`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <PushNotificationsPrompt />
    </div>
  );
}
