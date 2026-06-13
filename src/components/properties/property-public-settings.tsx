"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PropertyGalleryUpload } from "@/components/properties/property-gallery-upload";
import {
  suggestPropertySlug,
  useUpdatePropertyPublic,
} from "@/hooks/use-property-public";
import type { Property } from "@/types/database";
import { toast } from "sonner";

interface PropertyPublicSettingsProps {
  property: Property;
}

function normalizeGalleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((url): url is string => typeof url === "string");
}

export function PropertyPublicSettings({ property }: PropertyPublicSettingsProps) {
  const updatePublic = useUpdatePropertyPublic();

  const [shortDescription, setShortDescription] = useState(
    property.short_description ?? ""
  );
  const [capacity, setCapacity] = useState(
    property.capacity?.toString() ?? ""
  );
  const [amenitiesText, setAmenitiesText] = useState(
    (property.amenities ?? []).join(", ")
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() =>
    normalizeGalleryUrls(property.gallery_urls).length > 0
      ? normalizeGalleryUrls(property.gallery_urls)
      : property.image_url
        ? [property.image_url]
        : []
  );

  useEffect(() => {
    setShortDescription(property.short_description ?? "");
    setCapacity(property.capacity?.toString() ?? "");
    setAmenitiesText((property.amenities ?? []).join(", "));
    const urls = normalizeGalleryUrls(property.gallery_urls);
    setGalleryUrls(
      urls.length > 0 ? urls : property.image_url ? [property.image_url] : []
    );
  }, [property]);

  function handleSave() {
    const amenities = amenitiesText
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    updatePublic.mutate(
      {
        id: property.id,
        slug: property.slug ?? suggestPropertySlug(property.name),
        short_description: shortDescription,
        capacity: capacity ? Number.parseInt(capacity, 10) : null,
        amenities,
        gallery_urls: galleryUrls,
        is_public: property.is_public ?? false,
      },
      {
        onSuccess: () => toast.success("Listing details saved"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Error"),
      }
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>Listing details</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Photos, description and amenities shown on your booking site
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        <PropertyGalleryUpload
          propertyId={property.id}
          value={galleryUrls}
          onChange={setGalleryUrls}
        />

        <div className="space-y-2">
          <Label htmlFor={`capacity-${property.id}`}>Capacity (guests)</Label>
          <Input
            id={`capacity-${property.id}`}
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`short-${property.id}`}>Short description</Label>
          <Textarea
            id={`short-${property.id}`}
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`amenities-${property.id}`}>
            Amenities (comma-separated)
          </Label>
          <Input
            id={`amenities-${property.id}`}
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
            placeholder="WiFi, Parking, A/C, Pool"
          />
        </div>

        <Button onClick={handleSave} disabled={updatePublic.isPending}>
          {updatePublic.isPending ? "Saving…" : "Save listing details"}
        </Button>
      </CardContent>
    </Card>
  );
}
