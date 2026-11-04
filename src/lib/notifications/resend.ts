import "server-only";

import type { EmailSendResult } from "@/lib/notifications/dispatch";

export function hostviaFromAddress(): string {
  return (
    process.env.BOOKING_NOTIFICATION_FROM?.trim() ||
    "Hostvia <notifications@hostvia.me>"
  );
}

export function hasResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendResendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      retryable: false,
      error: "RESEND_API_KEY is not configured",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: hostviaFromAddress(),
        to: [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!res.ok) {
      console.error("[email] Resend error", res.status);
      return {
        ok: false,
        retryable: res.status >= 500 || res.status === 429,
        error: `Resend ${res.status}`,
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("[email] Resend request failed");
    void error;
    return { ok: false, retryable: true, error: "Network error" };
  }
}

export function hasTelegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() &&
      process.env.TELEGRAM_NOTIFY_CHAT_ID?.trim()
  );
}

export async function sendTelegramMessage(
  text: string
): Promise<EmailSendResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_NOTIFY_CHAT_ID?.trim();
  if (!botToken || !chatId) {
    return { ok: false, retryable: false, error: "Telegram is not configured" };
  }

  try {
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
      console.error("[email] Telegram error", res.status);
      return {
        ok: false,
        retryable: res.status >= 500 || res.status === 429,
        error: `Telegram ${res.status}`,
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("[email] Telegram request failed");
    void error;
    return { ok: false, retryable: true, error: "Network error" };
  }
}
