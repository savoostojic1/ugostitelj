"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PropertyGalleryUpload } from "@/components/properties/property-gallery-upload";
import { useHostProfile } from "@/hooks/use-host-profile";
import {
  getBookingSiteLabel,
  getBookingSitePath,
} from "@/lib/public/booking-site-url";
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
  const { data: hostProfile } = useHostProfile();
  const updatePublic = useUpdatePropertyPublic();

  const [isPublic, setIsPublic] = useState(property.is_public ?? false);
  const [slug, setSlug] = useState(property.slug ?? suggestPropertySlug(property.name));
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
    setIsPublic(property.is_public ?? false);
    setSlug(property.slug ?? suggestPropertySlug(property.name));
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
        slug,
        short_description: shortDescription,
        capacity: capacity ? Number.parseInt(capacity, 10) : null,
        amenities,
        gallery_urls: galleryUrls,
        is_public: isPublic,
      },
      {
        onSuccess: () => toast.success("Public page saved"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Error"),
      }
    );
  }

  const hostPublicPath =
    hostProfile?.username && hostProfile.is_published
      ? `${getBookingSitePath(hostProfile.username)}${slug ? `#${slug}` : ""}`
      : null;
  const hostPublicLabel =
    hostProfile?.username && hostProfile.is_published
      ? `${getBookingSiteLabel(hostProfile.username) ?? getBookingSitePath(hostProfile.username)}${slug ? `#${slug}` : ""}`
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Public page</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown on your booking site alongside your other listings
          </p>
        </div>
        {isPublic && hostPublicPath ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hostPublicPath} target="_blank">
              <ExternalLink className="h-4 w-4" />
              View
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm font-medium">Publish on booking site</span>
        </label>

        <PropertyGalleryUpload
          propertyId={property.id}
          value={galleryUrls}
          onChange={setGalleryUrls}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`slug-${property.id}`}>Section ID (anchor)</Label>
            <Input
              id={`slug-${property.id}`}
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="sea-view-villa"
            />
            {hostPublicLabel && slug ? (
              <p className="text-xs text-muted-foreground">
                {hostPublicLabel}
              </p>
            ) : null}
          </div>
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
          {updatePublic.isPending ? "Saving…" : "Save public page"}
        </Button>
      </CardContent>
    </Card>
  );
}
