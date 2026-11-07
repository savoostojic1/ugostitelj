import "server-only";

import {
  buildGuestReservationView,
  tokenAuthorizes,
  type CancellationSource,
  type GuestReservationRecord,
  type GuestReservationView,
  type StoredBookingStatus,
} from "@/lib/reservations/guest-access";
import { parseMoneyAmount } from "@/lib/currency/format";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

type PropertyEmbed = {
  name?: string | null;
  address?: string | null;
  house_rules?: string | null;
};

export async function loadGuestReservation(
  token: string,
  now = new Date()
): Promise<GuestReservationView> {
  if (!hasServiceRoleKey()) return { state: "unavailable" };

  try {
    const supabase = createServiceClient();
    const { hashManageToken } = await import("@/lib/reservations/guest-access");
    const hash = hashManageToken(token);
    const { data, error } = await supabase
      .from("booking_requests")
      .select(
        `
        manage_token_hash,
        manage_token_expires_at,
        reference_code,
        status,
        cancelled_at,
        cancelled_by,
        guest_name,
        check_in,
        check_out,
        guest_count,
        host_id,
        currency_code,
        nightly_rate,
        total_amount,
        properties ( name, address, house_rules )
      `
      )
      .eq("manage_token_hash", hash)
      .maybeSingle();

    if (error) {
      console.error("[reservation-manage] load failed", error.code);
      return { state: "unavailable" };
    }

    if (!data) return { state: "invalid" };

    const row = data as {
      manage_token_hash: string | null;
      manage_token_expires_at: string | null;
      reference_code: string | null;
      status: StoredBookingStatus;
      cancelled_at: string | null;
      cancelled_by: CancellationSource | null;
      guest_name: string;
      check_in: string;
      check_out: string;
      guest_count: number;
      host_id: string;
      currency_code?: string | null;
      nightly_rate?: number | string | null;
      total_amount?: number | string | null;
      properties: PropertyEmbed | PropertyEmbed[] | null;
    };

    if (!tokenAuthorizes(row.manage_token_hash, token)) {
      return { state: "invalid" };
    }

    const property = Array.isArray(row.properties)
      ? row.properties[0]
      : row.properties;

    const { data: profile } = await supabase
      .from("host_profiles")
      .select("business_name, contact_email, contact_phone, username")
      .eq("id", row.host_id)
      .maybeSingle();

    const record: GuestReservationRecord = {
      status: row.status,
      cancelledAt: row.cancelled_at,
      cancelledBy: row.cancelled_by,
      expiresAt: row.manage_token_expires_at,
      reference: row.reference_code,
      propertyName: property?.name?.trim() || "Property",
      propertyAddress: property?.address ?? null,
      checkIn: row.check_in,
      checkOut: row.check_out,
      guestCount: row.guest_count,
      guestName: row.guest_name,
      houseRules: property?.house_rules ?? null,
      hostName: profile?.business_name || profile?.username || null,
      hostEmail: profile?.contact_email ?? null,
      hostPhone: profile?.contact_phone ?? null,
      currencyCode: row.currency_code,
      totalAmount: parseMoneyAmount(row.total_amount),
      nightlyRate: parseMoneyAmount(row.nightly_rate),
    };

    return buildGuestReservationView(record, now);
  } catch (error) {
    console.error("[reservation-manage] unavailable");
    void error;
    return { state: "unavailable" };
  }
}
