import { format } from "date-fns";
import { sendWebPushToUser } from "@/lib/push/send-web-push";
import { getSiteBaseUrl } from "@/lib/public/site-url";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

type BookingRequestRow = {
  id: string;
  guest_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  message: string | null;
  host_id: string;
  property: { name: string; slug: string } | null;
  host: { business_name: string; contact_email: string | null; username: string } | null;
};

function formatDate(value: string): string {
  try {
    return format(new Date(`${value}T12:00:00`), "d MMM yyyy");
  } catch {
    return value;
  }
}

async function resolveHostEmail(
  hostId: string,
  contactEmail: string | null
): Promise<string | null> {
  if (contactEmail?.trim()) return contactEmail.trim();

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.getUserById(hostId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

async function sendResendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const from =
    process.env.BOOKING_NOTIFICATION_FROM?.trim() ??
    "Hostvia <notifications@hostvia.me>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[booking-notification] Resend error:", res.status, body);
  }
}

async function sendTelegramMessage(text: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_NOTIFY_CHAT_ID?.trim();
  if (!botToken || !chatId) return;

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error("[booking-notification] Telegram error:", res.status, body);
  }
}

export async function notifyHostOfBookingRequest(
  requestId: string
): Promise<void> {
  if (!hasServiceRoleKey()) {
    console.warn(
      "[booking-notification] Skipped — SUPABASE_SERVICE_ROLE_KEY not set"
    );
    return;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select(
      `
      id,
      guest_name,
      email,
      phone,
      check_in,
      check_out,
      guest_count,
      message,
      host_id,
      property:properties ( name, slug ),
      host:host_profiles ( business_name, contact_email, username )
    `
    )
    .eq("id", requestId)
    .single();

  if (error || !data) {
    console.error("[booking-notification] Load failed:", error?.message);
    return;
  }

  const row = data as unknown as BookingRequestRow;
  const propertyName = row.property?.name ?? "your property";
  const businessName = row.host?.business_name ?? "your booking site";
  const hostEmail = await resolveHostEmail(
    row.host_id,
    row.host?.contact_email ?? null
  );

  const dashboardUrl = `${getSiteBaseUrl()}/dashboard/booking-requests`;
  const dates = `${formatDate(row.check_in)} → ${formatDate(row.check_out)}`;
  const guestLine = `${row.guest_name} · ${row.guest_count} guest(s)`;

  const text = [
    `New booking inquiry — ${propertyName}`,
    "",
    guestLine,
    `Dates: ${dates}`,
    `Email: ${row.email}`,
    `Phone: ${row.phone}`,
    row.message ? `Message: ${row.message}` : null,
    "",
    `Open dashboard: ${dashboardUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b">
      <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#71717a">
        New booking inquiry
      </p>
      <h1 style="margin:0 0 16px;font-size:20px">${propertyName}</h1>
      <p style="margin:0 0 4px"><strong>${row.guest_name}</strong> · ${row.guest_count} guest(s)</p>
      <p style="margin:0 0 4px">${dates}</p>
      <p style="margin:0 0 4px"><a href="mailto:${row.email}">${row.email}</a></p>
      <p style="margin:0 0 16px"><a href="tel:${row.phone}">${row.phone}</a></p>
      ${
        row.message
          ? `<p style="margin:0 0 16px;padding:12px;background:#f4f4f5;border-radius:8px">${row.message}</p>`
          : ""
      }
      <p style="margin:0">
        <a href="${dashboardUrl}" style="display:inline-block;padding:10px 16px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          View in dashboard
        </a>
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#71717a">${businessName} · Hostvia</p>
    </div>
  `.trim();

  const pushTitle = "New booking inquiry";
  const pushBody = `${row.guest_name} · ${propertyName} · ${dates}`;

  const tasks: Promise<void>[] = [
    sendWebPushToUser(row.host_id, {
      title: pushTitle,
      body: pushBody,
      url: dashboardUrl,
    }),
  ];

  if (hostEmail && process.env.RESEND_API_KEY?.trim()) {
    tasks.push(
      sendResendEmail({
        to: hostEmail,
        subject: `New inquiry: ${propertyName} (${dates})`,
        text,
        html,
      })
    );
  }

  if (
    process.env.TELEGRAM_BOT_TOKEN?.trim() &&
    process.env.TELEGRAM_NOTIFY_CHAT_ID?.trim()
  ) {
    tasks.push(sendTelegramMessage(text));
  }

  await Promise.allSettled(tasks);
}
