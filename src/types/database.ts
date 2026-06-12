export type CalendarPlatform = "airbnb" | "booking" | "custom";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyPriceRule {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  created_at: string;
}

export interface Property {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  image_url: string | null;
  export_token?: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  capacity?: number | null;
  amenities?: string[];
  house_rules?: string | null;
  starting_price?: number | null;
  gallery_urls?: string[];
  is_public?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamAccessUser {
  id: string;
  host_id: string;
  auth_user_id: string;
  username: string;
  login_email: string;
  display_name: string | null;
  password_plain: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface HostProfile {
  id: string;
  username: string;
  business_name: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  description: string | null;
  footer_description?: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  map_embed_url?: string | null;
  social_links: Record<string, string>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type BookingRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "contacted";

export interface BookingRequest {
  id: string;
  property_id: string;
  host_id: string;
  guest_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  message: string | null;
  status: BookingRequestStatus;
  created_at: string;
  updated_at: string;
  properties?: { name: string; slug: string | null } | null;
}

export interface CalendarFeed {
  id: string;
  property_id: string;
  platform: CalendarPlatform;
  name: string;
  ics_url: string;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  property_id: string;
  user_id?: string;
  calendar_feed_id: string | null;
  external_uid: string;
  title: string;
  check_in: string;
  check_out: string;
  platform: CalendarPlatform;
  is_manual?: boolean;
  source?: string | null;
  guest_phone?: string | null;
  price?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyWithRelations extends Property {
  calendar_feeds?: CalendarFeed[];
  reservations?: Reservation[];
}

export type CalendarFeedInsert = Pick<
  CalendarFeed,
  "property_id" | "platform" | "name" | "ics_url"
>;

export type PropertyInsert = Pick<Property, "name">;

export type ManualReservationInsert = {
  property_id: string;
  title: string;
  check_in: string;
  check_out: string;
  source: string;
  guest_phone?: string | null;
  price: number;
};

export type ManualReservationUpdate = ManualReservationInsert & {
  id: string;
};

export interface SavedMessage {
  id: string;
  user_id: string;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export type SavedMessageInsert = Pick<SavedMessage, "name" | "body">;

export type SavedMessageUpdate = SavedMessageInsert & {
  id: string;
};
