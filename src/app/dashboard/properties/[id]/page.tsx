"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyNameEditor } from "@/components/properties/property-name-editor";
import { PropertyDeleteButton } from "@/components/properties/property-delete-button";
import { PropertyDetailNav } from "@/components/properties/property-detail-nav";
import { ConnectedFeeds } from "@/components/properties/connected-feeds";
import { PropertyExportCalendar } from "@/components/properties/property-export-calendar";
import { PropertyPricingSettings } from "@/components/properties/property-pricing-settings";
import { PropertyPublicSettings } from "@/components/properties/property-public-settings";
import { useProperty, usePropertyFeeds, useReservations } from "@/hooks/use-properties";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: property, isLoading } = useProperty(id);
  const { data: feeds = [], isLoading: feedsLoading } = usePropertyFeeds(id);
  const { data: reservations = [] } = useReservations(id);

  if (isLoading) {
    return null;
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <p className="text-foreground">Property not found</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/properties">Back to list</Link>
        </Button>
      </div>
    );
  }

  const needsCalendarSetup =
    !feedsLoading && feeds.length === 0 && reservations.length === 0;

  const calendarIntegrations = (
    <>
      <ConnectedFeeds propertyId={id} />
      {property.export_token && (
        <PropertyExportCalendar
          propertyName={property.name}
          exportToken={property.export_token}
        />
      )}
    </>
  );

  return (
    <div className="hostvia-property-page hostvia-pwa-property-page space-y-8">
      <Button variant="ghost" size="sm" asChild className="hostvia-dashboard-page-inset w-fit">
        <Link href="/dashboard/properties">
          <ArrowLeft className="h-4 w-4" />
          Properties
        </Link>
      </Button>

      <div className="hostvia-dashboard-page-inset flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PropertyNameEditor propertyId={id} name={property.name} />
        <PropertyDeleteButton propertyId={id} propertyName={property.name} />
      </div>

      <PropertyDetailNav propertyId={id} />

      <Card className="hostvia-glow-card overflow-hidden border-0 bg-transparent">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="font-medium">Calendar & reservations</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {needsCalendarSetup
                ? "Connect calendars below, then open the calendar to view availability."
                : "View the calendar and reservations."}
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href={`/dashboard/properties/${id}/calendar`}>
              <CalendarDays className="h-4 w-4" />
              Open calendar
            </Link>
          </Button>
        </CardContent>
      </Card>

      {feedsLoading && reservations.length === 0
        ? null
        : calendarIntegrations}

      <PropertyPricingSettings property={property} />

      <PropertyPublicSettings property={property} />
    </div>
  );
}
