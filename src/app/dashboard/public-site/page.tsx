"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { BookingSiteUrlPanel } from "@/components/dashboard/booking-site-url-panel";
import { SetupStepBanner } from "@/components/dashboard/setup-step-banner";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardRichTextarea } from "@/components/dashboard/dashboard-rich-textarea";
import { HostCoverUpload } from "@/components/dashboard/host-cover-upload";
import { cn } from "@/lib/utils";
import {
  useHostProfile,
  useUpdateHostProfile,
} from "@/hooks/use-host-profile";
import { parseGoogleMapsEmbedUrl } from "@/lib/public/google-maps-embed";
import { toast } from "sonner";
import { WebsiteExperienceSwitch } from "@/components/website-builder/experience-switch";

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

function PublishBookingSiteSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70",
        checked
          ? "border-violet-400/25 bg-violet-500/[0.08]"
          : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
      )}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            checked
              ? "bg-violet-500/15 text-violet-300"
              : "bg-white/[0.04] text-zinc-500"
          )}
        >
          <Globe className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-white">
            Publish booking site
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
            {checked
              ? "Your page is set to go live. Save to publish it for guests."
              : "Your page stays private. Turn this on, then save, to publish it."}
          </span>
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-8 w-14 shrink-0 rounded-full p-1 transition-shadow duration-200",
          checked
            ? "shadow-[0_0_18px_rgba(139,92,246,0.45)] [background:var(--hostvia-gradient)]"
            : "bg-white/10 ring-1 ring-white/10 ring-inset"
        )}
      >
        <span
          className={cn(
            "block h-6 w-6 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.28)] transition-transform duration-200 ease-out",
            checked ? "translate-x-6" : "translate-x-0"
          )}
        />
      </span>
    </button>
  );
}

export default function PublicSiteSettingsPage() {
  const { data: profile, isLoading } = useHostProfile();
  const updateProfile = useUpdateHostProfile();

  const [username, setUsername] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [footerDescription, setFooterDescription] = useState("");
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
    setFooterDescription(profile.footer_description ?? "");
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
        footer_description: footerDescription,
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
      <SetupStepBanner stepId="booking-site" />
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

      <WebsiteExperienceSwitch />

      <Card>
        <CardHeader>
          <CardTitle>Host profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PublishBookingSiteSwitch
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />

          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <DashboardRichTextarea
            id="description"
            label="Hero description"
            hint="Shown at the top of your booking site. Line breaks are preserved."
            value={description}
            onChange={setDescription}
            rows={6}
            placeholder="Welcome guests and describe your accommodation…"
          />

          <DashboardRichTextarea
            id="footerDescription"
            label="Footer description"
            hint="Short text in the page footer, below your business name."
            value={footerDescription}
            onChange={setFooterDescription}
            rows={4}
            placeholder="A few words about your place, location, or how to reach you…"
          />

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
