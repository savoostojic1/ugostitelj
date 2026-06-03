export type CalendarPlatform = "airbnb" | "booking" | "custom";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
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
