export interface PublicHostProfile {
  username: string;
  business_name: string;
  cover_image_url: string | null;
  logo_url: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  map_embed_url: string | null;
  social_links: Record<string, string>;
}

/** Rezultat pretrage — samo za prikaz u listi */
export interface PublicPropertySearchResult {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  address: string | null;
  image_url: string | null;
  gallery_urls: string[];
  starting_price: number | null;
  stay_total?: number | null;
}

/** @deprecated Koristi PublicPropertySearchResult */
export type PublicPropertyListing = PublicPropertySearchResult & {
  description?: string | null;
  gallery_urls?: string[];
  capacity?: number | null;
  amenities?: string[];
  house_rules?: string | null;
  starting_price?: number | null;
};

export interface PublicPropertyHost {
  username: string;
  business_name: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
}

export interface PublicHostProperty {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  address: string | null;
  image_url: string | null;
  gallery_urls: string[];
  capacity: number | null;
  amenities: string[];
  house_rules?: string | null;
  starting_price: number | null;
  stay_total?: number | null;
}

export interface PublicReservationSpan {
  check_in: string;
  check_out: string;
}

export interface HostSearchParams {
  checkIn: string;
  checkOut: string;
  guests: number;
}
