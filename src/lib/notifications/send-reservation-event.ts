import "server-only";

import {
  dispatchReservationNotice,
  type BookingNotice,
  type DispatchChannelResult,
} from "@/lib/notifications/dispatch";
import {
  decideDeliveryAttempt,
  notificationEventForState,
  type DeliveryChannel,
  type ReservationEventName,
} from "@/lib/notifications/delivery";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  preferencesFromRow,
} from "@/lib/notifications/preferences";
import {
  hasTelegramConfigured,
  sendResendEmail,
  sendTelegramMessage,
} from "@/lib/notifications/resend";
import { sendWebPushToUser } from "@/lib/push/send-web-push";
import { getSiteBaseUrl } from "@/lib/public/site-url";
import { reservationLinkSecret } from "@/lib/reservations/guest-link-secret";
import {
  formatStayDate,
  formatTimestamp,
  guestCountLabel,
  guestReservationStatus,
  openManageToken,
  type CancellationSource,
  type GuestReservationStatus,
  type StoredBookingStatus,
} from "@/lib/reservations/guest-access";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

type PropertyEmbed = {
  name?: string | null;
  address?: string | null;
  house_rules?: string | null;
};

type BookingRow = {
  id: string;
  host_id: string;
  guest_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  message: string | null;
  status: StoredBookingStatus;
  reference_code: string | null;
  manage_token_ciphertext: string | null;
  cancelled_at: string | null;
  cancelled_by: CancellationSource | null;
  properties: PropertyEmbed | PropertyEmbed[] | null;
};

function firstProperty(value: BookingRow["properties"]): PropertyEmbed | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function manageUrlFor(
  ciphertext: string | null,
  overrideToken: string | undefined
): string | null {
  const secret = reservationLinkSecret();
  const token =
    overrideToken ||
    (ciphertext && secret ? openManageToken(ciphertext, secret) : null);
  if (!token) return null;
  return `${getSiteBaseUrl()}/reservation/manage/${token}`;
}

async function loadNotice(
  bookingRequestId: string,
  manageToken?: string
): Promise<BookingNotice | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select(
      `
      id,
      host_id,
      guest_name,
      email,
      phone,
      check_in,
      check_out,
      guest_count,
      message,
      status,
      reference_code,
      manage_token_ciphertext,
      cancelled_at,
      cancelled_by,
      properties ( name, address, house_rules )
    `
    )
    .eq("id", bookingRequestId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[reservation-notification] load failed");
    return null;
  }

  const row = data as unknown as BookingRow;
  const property = firstProperty(row.properties);
  const status = guestReservationStatus({
    status: row.status,
    cancelledAt: row.cancelled_at,
  });

  const { data: profile } = await supabase
    .from("host_profiles")
    .select("business_name, contact_email, contact_phone, username")
    .eq("id", row.host_id)
    .maybeSingle();

  let ownerEmail: string | null = null;
  try {
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(row.host_id);
    if (!userError && userData.user?.email) {
      ownerEmail = userData.user.email;
    }
  } catch (userError) {
    console.error("[reservation-notification] owner lookup failed");
    void userError;
  }

  if (!ownerEmail && profile?.contact_email) {
    ownerEmail = profile.contact_email;
  }

  const rules = property?.house_rules?.trim() || null;

  return {
    id: row.id,
    hostId: row.host_id,
    status,
    locale: "en",
    propertyName: property?.name?.trim() || "Property",
    propertyAddress: property?.address?.trim() || null,
    houseRules: rules ? rules.slice(0, 600) : null,
    checkInLabel: formatStayDate(row.check_in),
    checkOutLabel: formatStayDate(row.check_out),
    guestCountLabel: guestCountLabel(row.guest_count),
    guestName: row.guest_name,
    guestEmail: row.email,
    guestPhone: row.phone,
    reference: row.reference_code,
    manageUrl: manageUrlFor(row.manage_token_ciphertext, manageToken),
    dashboardUrl: dashboardUrlFor(status),
    hostName: profile?.business_name?.trim() || profile?.username || null,
    hostEmail: profile?.contact_email?.trim() || null,
    hostPhone: profile?.contact_phone?.trim() || null,
    cancelledAtLabel: row.cancelled_at ? formatTimestamp(row.cancelled_at) : null,
    cancelledBy: row.cancelled_by,
    message: row.message,
    ownerEmail,
  };
}

function dashboardUrlFor(status: GuestReservationStatus): string {
  const path =
    status === "confirmed"
      ? "/dashboard/manual-reservations"
      : "/dashboard/booking-requests";
  return `${getSiteBaseUrl()}${path}`;
}

function isUniqueViolation(error: { code?: string; message?: string }): boolean {
  return error.code === "23505" || (error.message ?? "").includes("duplicate key");
}

export async function dispatchReservationEvent(
  bookingRequestId: string,
  event: ReservationEventName,
  options?: { manageToken?: string }
): Promise<{ ok: true; results: DispatchChannelResult[] }> {
  if (!hasServiceRoleKey()) {
    console.warn("[reservation-notification] skipped — service role missing");
    return { ok: true, results: [] };
  }

  const supabase = createServiceClient();

  return dispatchReservationNotice(
    {
      now: () => new Date(),
      load: () => loadNotice(bookingRequestId, options?.manageToken),
      preferences: async (hostId) => {
        const { data, error } = await supabase
          .from("host_notification_preferences")
          .select(
            "email_new_request, email_confirmation, email_cancellation, push_new_request, push_confirmation, push_cancellation"
          )
          .eq("host_id", hostId)
          .maybeSingle();
        if (error || !data) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
        return preferencesFromRow(data);
      },
      claim: async (input) => {
        const timestamp = new Date(input.now).toISOString();
        const inserted = await supabase.from("notification_deliveries").insert({
          booking_request_id: input.bookingRequestId,
          event_key: input.event,
          channel: input.channel,
          status: "pending",
          attempt_count: 1,
          updated_at: timestamp,
        });

        if (!inserted.error) return "send";
        if (!isUniqueViolation(inserted.error)) {
          console.error("[reservation-notification] claim failed");
          return "error";
        }

        const existing = await supabase
          .from("notification_deliveries")
          .select("status, attempt_count, updated_at")
          .eq("booking_request_id", input.bookingRequestId)
          .eq("event_key", input.event)
          .eq("channel", input.channel)
          .maybeSingle();

        if (existing.error || !existing.data) return "error";

        const row = existing.data as {
          status: "pending" | "sent" | "failed" | "skipped";
          attempt_count: number;
          updated_at: string;
        };
        const decision = decideDeliveryAttempt(
          {
            status: row.status,
            attemptCount: row.attempt_count,
            updatedAt: new Date(row.updated_at).getTime(),
          },
          input.now
        );
        if (decision === "skip") return "skip";

        const updated = await supabase
          .from("notification_deliveries")
          .update({
            status: "pending",
            attempt_count: row.attempt_count + 1,
            updated_at: timestamp,
            last_error: null,
          })
          .eq("booking_request_id", input.bookingRequestId)
          .eq("event_key", input.event)
          .eq("channel", input.channel)
          .in("status", ["failed", "pending"])
          .select("id");

        if (updated.error || !updated.data?.length) return "skip";
        return "send";
      },
      complete: async (input) => {
        await supabase
          .from("notification_deliveries")
          .update({
            status: input.status,
            last_error: input.error ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("booking_request_id", input.bookingRequestId)
          .eq("event_key", input.event)
          .eq("channel", input.channel);
      },
      finishJob: async (input) => {
        const existing = await supabase
          .from("notification_jobs")
          .select("attempt_count")
          .eq("booking_request_id", input.bookingRequestId)
          .eq("event_key", input.event)
          .maybeSingle();

        const attemptCount =
          ((existing.data as { attempt_count?: number } | null)?.attempt_count ??
            0) + 1;

        await supabase.from("notification_jobs").upsert(
          {
            booking_request_id: input.bookingRequestId,
            event_key: input.event,
            status: input.status,
            attempt_count: attemptCount,
            last_error: input.error ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "booking_request_id,event_key" }
        );
      },
      sendEmail: sendResendEmail,
      sendPush: async (push) => {
        const result = await sendWebPushToUser(push.hostId, {
          title: push.title,
          body: push.body,
          url: push.url,
          tag: push.tag,
        });
        if (result.delivered > 0) return "sent";
        if (result.reason === "failed") return "failed";
        return "skipped";
      },
      sendTelegram: hasTelegramConfigured() ? sendTelegramMessage : undefined,
    },
    bookingRequestId,
    event
  );
}

export async function retryDueReservationNotifications(limit = 20): Promise<{
  processed: number;
}> {
  if (!hasServiceRoleKey()) return { processed: 0 };

  const supabase = createServiceClient();
  const cutoff = new Date(Date.now() - 30_000).toISOString();
  const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

  const due = await supabase
    .from("notification_jobs")
    .select("booking_request_id, event_key, attempt_count")
    .in("status", ["pending", "failed"])
    .lt("attempt_count", 5)
    .lt("updated_at", cutoff)
    .order("updated_at", { ascending: true })
    .limit(limit);

  const jobs =
    (due.data as Array<{
      booking_request_id: string;
      event_key: ReservationEventName;
      attempt_count: number;
    }> | null) ?? [];

  const recent = await supabase
    .from("booking_requests")
    .select("id, status, cancelled_at, cancelled_by, created_at")
    .gt("created_at", since)
    .lt("created_at", cutoff)
    .limit(limit);

  const rows =
    (recent.data as Array<{
      id: string;
      status: StoredBookingStatus;
      cancelled_at: string | null;
      cancelled_by: CancellationSource | null;
    }> | null) ?? [];

  const queued = new Set(
    jobs.map((job) => `${job.booking_request_id}:${job.event_key}`)
  );

  for (const row of rows) {
    const event = notificationEventForState({
      status: guestReservationStatus({
        status: row.status,
        cancelledAt: row.cancelled_at,
      }),
      cancelledBy: row.cancelled_by,
    });
    if (!event) continue;
    const key = `${row.id}:${event}`;
    if (queued.has(key)) continue;

    const existing = await supabase
      .from("notification_jobs")
      .select("status")
      .eq("booking_request_id", row.id)
      .eq("event_key", event)
      .maybeSingle();

    if (existing.data) continue;

    queued.add(key);
    jobs.push({
      booking_request_id: row.id,
      event_key: event,
      attempt_count: 0,
    });
  }

  let processed = 0;
  for (const job of jobs.slice(0, limit)) {
    await dispatchReservationEvent(job.booking_request_id, job.event_key);
    processed += 1;
  }

  const stale = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("public_endpoint_hits").delete().lt("created_at", stale);

  return { processed };
}

export type { DeliveryChannel };
