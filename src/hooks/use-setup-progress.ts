"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { computeSetupProgress } from "@/lib/onboarding/setup-steps";
import { requireDashboardContext } from "@/lib/team-access/dashboard-context";
import { useHostProfile } from "@/hooks/use-host-profile";
import { useProperties, useReservations } from "@/hooks/use-properties";

export function useSetupProgress() {
  const { data: profile, isLoading: profileLoading } = useHostProfile();
  const { data: properties = [], isLoading: propertiesLoading } =
    useProperties();
  const { data: reservations = [], isLoading: reservationsLoading } =
    useReservations(undefined, { enabled: properties.length > 0 });

  const propertyIds = properties.map((property) => property.id);

  const { data: feedCount = 0, isLoading: feedsLoading } = useQuery({
    queryKey: ["setup-feed-count", propertyIds],
    queryFn: async () => {
      const supabase = createClient();
      await requireDashboardContext(supabase);

      const { count, error } = await supabase
        .from("calendar_feeds")
        .select("id", { count: "exact", head: true })
        .in("property_id", propertyIds);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: propertyIds.length > 0,
  });

  const firstPropertyId =
    properties.length > 0
      ? (properties.at(-1)?.id ?? properties[0]?.id ?? null)
      : null;

  const hasPublicListing = properties.some((property) => property.is_public);
  const hasSiteBasics = Boolean(
    profile?.business_name?.trim() &&
      (profile.description?.trim() ||
        profile.cover_image_url?.trim() ||
        profile.contact_email?.trim())
  );

  const progress = computeSetupProgress({
    propertyCount: properties.length,
    feedCount,
    reservationCount: reservations.length,
    isPublished: Boolean(profile?.is_published),
    hasPublicListing,
    hasSiteBasics,
    firstPropertyId,
  });

  return {
    progress,
    isLoading:
      profileLoading ||
      propertiesLoading ||
      (propertyIds.length > 0 && feedsLoading) ||
      (propertyIds.length > 0 && reservationsLoading),
  };
}
