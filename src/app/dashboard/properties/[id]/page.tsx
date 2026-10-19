"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyLockedBanner } from "@/components/properties/property-locked-banner";
import { PropertyDeleteButton } from "@/components/properties/property-delete-button";
import { PropertyDetailNav } from "@/components/properties/property-detail-nav";
import { PropertyNameEditor } from "@/components/properties/property-name-editor";
import { SetupStepBanner } from "@/components/dashboard/setup-step-banner";
import { PropertyPublishPanel } from "@/components/properties/property-publish-panel";
import { PropertyPricingSettings } from "@/components/properties/property-pricing-settings";
import { PropertyPublicSettings } from "@/components/properties/property-public-settings";
import { usePropertyPlanLock } from "@/hooks/use-property-plan-lock";
import { useProperty } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: property, isLoading } = useProperty(id);
  const { isLocked } = usePropertyPlanLock(id);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  return (
    <div className="hostvia-property-page hostvia-pwa-property-page space-y-8">
      <SetupStepBanner stepId="publish-listing" />
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="hostvia-dashboard-page-inset w-fit"
      >
        <Link href="/dashboard/properties">
          <ArrowLeft className="h-4 w-4" />
          Properties
        </Link>
      </Button>

      {isLocked ? (
        <div className="hostvia-dashboard-page-inset">
          <PropertyLockedBanner
            propertyName={property.name}
            onDelete={() => setDeleteOpen(true)}
          />
        </div>
      ) : null}

      <div className="hostvia-dashboard-page-inset flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PropertyNameEditor
          propertyId={id}
          name={property.name}
          readOnly={isLocked}
        />
        <PropertyDeleteButton
          propertyId={id}
          propertyName={property.name}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </div>

      {!isLocked ? <PropertyDetailNav propertyId={id} /> : null}

      {!isLocked ? (
        <div className="hostvia-dashboard-page-inset space-y-6">
          <PropertyPublishPanel property={property} />
          <PropertyPricingSettings property={property} />
          <PropertyPublicSettings property={property} />
        </div>
      ) : null}
    </div>
  );
}
