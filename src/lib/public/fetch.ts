import { createClient } from "@/lib/supabase/server";
import type {
  PublicHostProfile,
  PublicPropertyListing,
  PublicReservationSpan,
} from "./types";

function normalizePropertyListing(
  p: PublicPropertyListing
): PublicPropertyListing {
  return {
    ...p,
    gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
  };
}

export async function fetchPublicHost(
  username: string
): Promise<PublicHostProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_host_profile", {
    p_username: username,
  });

  if (error || !data) return null;
  return data as PublicHostProfile;
}

export async function fetchPublicHostProperties(
  username: string
): Promise<PublicPropertyListing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_host_properties", {
    p_username: username,
  });

  if (error || !data) return [];
  return (data as PublicPropertyListing[]).map(normalizePropertyListing);
}

export async function fetchPublicPropertyReservations(
  propertyId: string
): Promise<PublicReservationSpan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "get_public_property_reservations",
    { p_property_id: propertyId }
  );

  if (error || !data) return [];
  return data as PublicReservationSpan[];
}
