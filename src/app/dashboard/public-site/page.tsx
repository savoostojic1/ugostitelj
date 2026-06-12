"use client";

import { useEffect, useState } from "react";
import { BookingSiteUrlPanel } from "@/components/dashboard/booking-site-url-panel";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HostCoverUpload } from "@/components/dashboard/host-cover-upload";
import {
  useHostProfile,
  useUpdateHostProfile,
} from "@/hooks/use-host-profile";
import { parseGoogleMapsEmbedUrl } from "@/lib/public/google-maps-embed";
import { toast } from "sonner";

async function resolveMapEmbedUrl(input: string): Promise<string | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const direct = parseGoogleMapsEmbedUrl(trimmed);
  if (direct) return direct;

  const res = await fetch("/api/dashboard/resolve-map-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: trimmed }),
  });

  const data = await res.json();
  if (!res.ok) return null;
  return typeof data.embedUrl === "string" ? data.embedUrl : null;
}

export default function PublicSiteSettingsPage() {
  const { data: profile, isLoading } = useHostProfile();
  const updateProfile = useUpdateHostProfile();

  const [username, setUsername] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [location, setLocation] = useState("");
  const [mapEmbedInput, setMapEmbedInput] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [mapPreviewUrl, setMapPreviewUrl] = useState<string | null>(null);
  const [mapPreviewLoading, setMapPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username);
    setBusinessName(profile.business_name ?? "");
    setDescription(profile.description ?? "");
    setCoverImageUrl(profile.cover_image_url ?? "");
    setContactEmail(profile.contact_email ?? "");
    setContactPhone(profile.contact_phone ?? "");
    setLocation(profile.location ?? "");
    setMapEmbedInput(profile.map_embed_url ?? "");
    setInstagram(profile.social_links?.instagram ?? "");
    setFacebook(profile.social_links?.facebook ?? "");
    setIsPublished(profile.is_published);
  }, [profile]);

  useEffect(() => {
    if (!mapEmbedInput.trim()) {
      setMapPreviewUrl(null);
      setMapPreviewLoading(false);
      return;
    }

    const direct = parseGoogleMapsEmbedUrl(mapEmbedInput);
    if (direct) {
      setMapPreviewUrl(direct);
      setMapPreviewLoading(false);
      return;
    }

    setMapPreviewLoading(true);
    const timer = window.setTimeout(() => {
      resolveMapEmbedUrl(mapEmbedInput)
        .then((url) => setMapPreviewUrl(url))
        .catch(() => setMapPreviewUrl(null))
        .finally(() => setMapPreviewLoading(false));
    }, 500);

    return () => window.clearTimeout(timer);
  }, [mapEmbedInput]);

  async function handleSave() {
    setSaving(true);
    let mapEmbedUrl: string | null = null;

    try {
      if (mapEmbedInput.trim()) {
        mapEmbedUrl = await resolveMapEmbedUrl(mapEmbedInput);
        if (!mapEmbedUrl) {
          toast.error(
            "Google map not recognized — check the link and try again"
          );
          return;
        }
      }

      updateProfile.mutate(
      {
        username,
        business_name: businessName,
        description,
        cover_image_url: coverImageUrl,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        location,
        map_embed_url: mapEmbedUrl,
        social_links: {
          ...(instagram.trim() ? { instagram: instagram.trim() } : {}),
          ...(facebook.trim() ? { facebook: facebook.trim() } : {}),
        },
        is_published: isPublished,
      },
      {
        onSuccess: () => toast.success("Booking site saved"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Error"),
      }
    );
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Website"
        title="Booking site"
        description="Your public page for guests — booking inquiries come directly to you"
      />

      <BookingSiteUrlPanel
        username={username}
        onUsernameChange={setUsername}
        isPublished={isPublished}
      />

      <Card>
        <CardHeader>
          <CardTitle>Host profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-medium">Publish booking site</span>
          </label>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <HostCoverUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (text)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Budva, Montenegro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mapEmbed">Google map (optional)</Label>
            <Textarea
              id="mapEmbed"
              rows={3}
              value={mapEmbedInput}
              onChange={(e) => setMapEmbedInput(e.target.value)}
              placeholder="https://maps.app.goo.gl/... or embed link"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Paste a link from Google Maps (Share) or embed code. Short links
              like maps.app.goo.gl also work.
            </p>
          </div>

          {mapPreviewLoading ? (
            <p className="text-sm text-muted-foreground">Loading map…</p>
          ) : null}

          {mapPreviewUrl ? (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="relative aspect-video w-full">
                <iframe
                  title="Map preview"
                  src={mapPreviewUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (URL)</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook (URL)</Label>
              <Input
                id="facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending || saving}
          >
            {updateProfile.isPending || saving ? "Saving…" : "Save"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
