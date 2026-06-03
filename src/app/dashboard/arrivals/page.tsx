"use client";

import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReservations } from "@/hooks/use-properties";
import { groupArrivalsDepartures } from "@/lib/dashboard-stats";
import { PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/constants";
import { formatReservationLabel } from "@/lib/reservations/display";
import { cn } from "@/lib/utils";

function EventList({
  items,
  type,
}: {
  items: ReturnType<typeof groupArrivalsDepartures>["arrivalsToday"];
  type: "arrival" | "departure";
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No {type}s</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((r) => {
        const colors = PLATFORM_COLORS[r.platform];
        const date = type === "arrival" ? r.check_in : r.check_out;
        return (
          <div
            key={`${r.id}-${type}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
          >
            <div>
              <p className="font-medium text-sm">{r.propertyName}</p>
              <p className="text-xs text-muted-foreground">{formatReservationLabel(r.title, r.platform)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {type === "arrival" ? "Check-in" : "Check-out"}{" "}
                {format(parseISO(date), "EEE, MMM d")}
                {type === "arrival" && (
                  <> · Out {format(parseISO(r.check_out), "MMM d")}</>
                )}
                {type === "departure" && (
                  <> · In {format(parseISO(r.check_in), "MMM d")}</>
                )}
              </p>
            </div>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-xs",
                colors.bg,
                colors.border,
                colors.text
              )}
            >
              {PLATFORM_LABELS[r.platform]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Section({
  title,
  arrivals,
  departures,
}: {
  title: string;
  arrivals: ReturnType<typeof groupArrivalsDepartures>["arrivalsToday"];
  departures: ReturnType<typeof groupArrivalsDepartures>["departuresToday"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Arrivals</h3>
          <EventList items={arrivals} type="arrival" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Departures</h3>
          <EventList items={departures} type="departure" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ArrivalsPage() {
  const { data: reservations = [] } = useReservations();
  const groups = groupArrivalsDepartures(reservations);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Arrivals & Departures</h1>
        <p className="text-muted-foreground">
          Today, tomorrow, and this week across all properties
        </p>
      </div>

      <Section
        title="Today"
        arrivals={groups.arrivalsToday}
        departures={groups.departuresToday}
      />
      <Section
        title="Tomorrow"
        arrivals={groups.arrivalsTomorrow}
        departures={groups.departuresTomorrow}
      />
      <Section
        title="This Week"
        arrivals={groups.arrivalsThisWeek}
        departures={groups.departuresThisWeek}
      />
    </div>
  );
}
