import {
  guestEmail,
  ownerEmail,
  pushNotice,
  safeHttpUrl,
  type ReservationEmailData,
} from "@/lib/notifications/email-templates";
import {
  channelsForEvent,
  decideDeliveryAttempt,
  eventAllowedForStatus,
  isChannelEnabled,
  type DeliveryChannel,
  type ReservationEventName,
  type StoredDelivery,
} from "@/lib/notifications/delivery";
import type { NotificationPreferences } from "@/lib/notifications/preferences";
import type { GuestReservationStatus } from "@/lib/reservations/guest-access";

export type EmailSendResult =
  | { ok: true }
  | { ok: false; retryable: boolean; error: string };

export type ChannelOutcome = "sent" | "failed" | "skipped" | "duplicate";

export type DispatchChannelResult = {
  channel: DeliveryChannel;
  result: ChannelOutcome;
};

export type BookingNotice = ReservationEmailData & {
  id: string;
  hostId: string;
  status: GuestReservationStatus;
  ownerEmail: string | null;
};

export type DispatchPorts = {
  now: () => Date;
  load: (bookingRequestId: string) => Promise<BookingNotice | null>;
  preferences: (hostId: string) => Promise<NotificationPreferences>;
  claim: (input: {
    bookingRequestId: string;
    event: ReservationEventName;
    channel: DeliveryChannel;
    now: number;
  }) => Promise<"send" | "skip" | "error">;
  complete: (input: {
    bookingRequestId: string;
    event: ReservationEventName;
    channel: DeliveryChannel;
    status: "sent" | "failed" | "skipped";
    error?: string;
  }) => Promise<void>;
  finishJob?: (input: {
    bookingRequestId: string;
    event: ReservationEventName;
    status: "completed" | "failed";
    error?: string;
  }) => Promise<void>;
  sendEmail: (message: {
    to: string;
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }) => Promise<EmailSendResult>;
  sendPush: (input: {
    hostId: string;
    title: string;
    body: string;
    url: string;
    tag: string;
  }) => Promise<"sent" | "skipped" | "failed">;
  sendTelegram?: (text: string) => Promise<EmailSendResult>;
};

function replyTo(address: string | null | undefined): string | undefined {
  if (!address) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? address : undefined;
}

export function channelResult(
  results: DispatchChannelResult[],
  channel: DeliveryChannel
): ChannelOutcome {
  return results.find((item) => item.channel === channel)?.result ?? "skipped";
}

export async function dispatchReservationNotice(
  ports: DispatchPorts,
  bookingRequestId: string,
  event: ReservationEventName
): Promise<{ ok: true; results: DispatchChannelResult[] }> {
  const results: DispatchChannelResult[] = [];

  let notice: BookingNotice | null = null;
  try {
    notice = await ports.load(bookingRequestId);
  } catch (error) {
    console.error("[reservation-notification] load failed", bookingRequestId);
    void error;
    await finish(ports, bookingRequestId, event, "failed", "load failed");
    return { ok: true, results };
  }

  if (!notice || !eventAllowedForStatus(event, notice.status)) {
    await finish(ports, bookingRequestId, event, "completed");
    return { ok: true, results };
  }

  let prefs: NotificationPreferences;
  try {
    prefs = await ports.preferences(notice.hostId);
  } catch (error) {
    console.error("[reservation-notification] preferences failed", bookingRequestId);
    void error;
    await finish(ports, bookingRequestId, event, "failed", "preferences failed");
    return { ok: true, results };
  }

  const channels = channelsForEvent(event, {
    telegram: Boolean(ports.sendTelegram),
  });
  let failed = false;

  for (const channel of channels) {
    const outcome = await deliverChannel(ports, notice, prefs, event, channel);
    results.push(outcome);
    if (outcome.result === "failed") failed = true;
  }

  await finish(
    ports,
    bookingRequestId,
    event,
    failed ? "failed" : "completed",
    failed ? "one or more channels failed" : undefined
  );

  return { ok: true, results };
}

async function deliverChannel(
  ports: DispatchPorts,
  notice: BookingNotice,
  prefs: NotificationPreferences,
  event: ReservationEventName,
  channel: DeliveryChannel
): Promise<DispatchChannelResult> {
  const now = ports.now().getTime();
  let claim: "send" | "skip" | "error" = "error";
  try {
    claim = await ports.claim({
      bookingRequestId: notice.id,
      event,
      channel,
      now,
    });
  } catch (error) {
    console.error("[reservation-notification] claim failed", event, channel);
    void error;
  }

  if (claim === "skip") return { channel, result: "duplicate" };
  if (claim === "error") return { channel, result: "failed" };

  if (!isChannelEnabled(prefs, event, channel)) {
    await safeComplete(ports, notice.id, event, channel, "skipped", "disabled");
    return { channel, result: "skipped" };
  }

  try {
    if (channel === "email_guest" || channel === "email_owner") {
      const emailResult = await sendNoticeEmail(ports, notice, event, channel);
      if (emailResult.ok) {
        await safeComplete(ports, notice.id, event, channel, "sent");
        return { channel, result: "sent" };
      }
      await safeComplete(
        ports,
        notice.id,
        event,
        channel,
        emailResult.retryable ? "failed" : "skipped",
        emailResult.error
      );
      return {
        channel,
        result: emailResult.retryable ? "failed" : "skipped",
      };
    }

    if (channel === "push_owner") {
      const push = pushNotice(event, notice);
      if (
        notice.guestEmail &&
        (push.body.includes(notice.guestEmail) ||
          push.title.includes(notice.guestEmail))
      ) {
        await safeComplete(ports, notice.id, event, channel, "skipped", "unsafe push");
        return { channel, result: "skipped" };
      }
      const pushed = await ports.sendPush({
        hostId: notice.hostId,
        title: push.title,
        body: push.body,
        url: push.url,
        tag: push.tag,
      });
      if (pushed === "sent") {
        await safeComplete(ports, notice.id, event, channel, "sent");
        return { channel, result: "sent" };
      }
      if (pushed === "failed") {
        await safeComplete(ports, notice.id, event, channel, "failed", "push failed");
        return { channel, result: "failed" };
      }
      await safeComplete(ports, notice.id, event, channel, "skipped", "push unavailable");
      return { channel, result: "skipped" };
    }

    if (!ports.sendTelegram) {
      await safeComplete(ports, notice.id, event, channel, "skipped", "telegram off");
      return { channel, result: "skipped" };
    }

    const telegram = ownerEmail(event, notice);
    const telegramResult = await ports.sendTelegram(telegram.text);
    if (telegramResult.ok) {
      await safeComplete(ports, notice.id, event, channel, "sent");
      return { channel, result: "sent" };
    }
    await safeComplete(
      ports,
      notice.id,
      event,
      channel,
      telegramResult.retryable ? "failed" : "skipped",
      telegramResult.error
    );
    return {
      channel,
      result: telegramResult.retryable ? "failed" : "skipped",
    };
  } catch (error) {
    console.error("[reservation-notification] channel failed", event, channel);
    void error;
    await safeComplete(ports, notice.id, event, channel, "failed", "unexpected error");
    return { channel, result: "failed" };
  }
}

async function sendNoticeEmail(
  ports: DispatchPorts,
  notice: BookingNotice,
  event: ReservationEventName,
  channel: "email_guest" | "email_owner"
): Promise<EmailSendResult> {
  if (channel === "email_guest") {
    if (!replyTo(notice.guestEmail)) {
      return { ok: false, retryable: false, error: "guest email missing" };
    }
    const content = guestEmail(event, notice);
    return ports.sendEmail({
      to: notice.guestEmail,
      subject: content.subject,
      text: content.text,
      html: content.html,
      replyTo: replyTo(notice.hostEmail),
    });
  }

  if (!replyTo(notice.ownerEmail)) {
    return { ok: false, retryable: false, error: "owner email missing" };
  }
  const content = ownerEmail(event, notice);
  const dashboard = safeHttpUrl(notice.dashboardUrl);
  if (event === "request_received" && dashboard && !content.text.includes(dashboard)) {
    return { ok: false, retryable: false, error: "owner email missing dashboard link" };
  }
  return ports.sendEmail({
    to: notice.ownerEmail!,
    subject: content.subject,
    text: content.text,
    html: content.html,
    replyTo: replyTo(notice.guestEmail),
  });
}

async function safeComplete(
  ports: DispatchPorts,
  bookingRequestId: string,
  event: ReservationEventName,
  channel: DeliveryChannel,
  status: "sent" | "failed" | "skipped",
  error?: string
) {
  try {
    await ports.complete({ bookingRequestId, event, channel, status, error });
  } catch (completeError) {
    console.error("[reservation-notification] complete failed", event, channel);
    void completeError;
  }
}

async function finish(
  ports: DispatchPorts,
  bookingRequestId: string,
  event: ReservationEventName,
  status: "completed" | "failed",
  error?: string
) {
  if (!ports.finishJob) return;
  try {
    await ports.finishJob({ bookingRequestId, event, status, error });
  } catch (finishError) {
    console.error("[reservation-notification] job update failed", event);
    void finishError;
  }
}

export function memoryDeliveryStore() {
  const deliveries = new Map<string, StoredDelivery>();

  function key(input: {
    bookingRequestId: string;
    event: ReservationEventName;
    channel: DeliveryChannel;
  }) {
    return `${input.bookingRequestId}:${input.event}:${input.channel}`;
  }

  return {
    deliveries,
    claim: async (input: {
      bookingRequestId: string;
      event: ReservationEventName;
      channel: DeliveryChannel;
      now: number;
    }) => {
      const id = key(input);
      const existing = deliveries.get(id) ?? null;
      const decision = decideDeliveryAttempt(existing, input.now);
      if (decision === "skip") return "skip" as const;
      deliveries.set(id, {
        status: "pending",
        attemptCount: (existing?.attemptCount ?? 0) + 1,
        updatedAt: input.now,
      });
      return "send" as const;
    },
    complete: async (input: {
      bookingRequestId: string;
      event: ReservationEventName;
      channel: DeliveryChannel;
      status: "sent" | "failed" | "skipped";
    }) => {
      const id = key(input);
      const existing = deliveries.get(id);
      if (!existing) return;
      deliveries.set(id, {
        ...existing,
        status: input.status,
        updatedAt: existing.updatedAt,
      });
    },
  };
}
