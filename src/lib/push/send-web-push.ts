import webpush from "web-push";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { getVapidPublicKey, hasWebPushConfigured } from "@/lib/push/vapid";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  if (!hasWebPushConfigured()) return false;

  const publicKey = getVapidPublicKey();
  if (!publicKey) return false;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() ?? "mailto:hello@hostvia.me",
    publicKey,
    process.env.VAPID_PRIVATE_KEY!.trim()
  );
  vapidConfigured = true;
  return true;
}

export async function sendWebPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  if (!hasServiceRoleKey()) {
    console.warn("[web-push] Skipped — SUPABASE_SERVICE_ROLE_KEY not set");
    return;
  }

  if (!ensureVapidConfigured()) {
    console.warn("[web-push] Skipped — VAPID keys not configured");
    return;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error("[web-push] load subscriptions failed:", error.message);
    return;
  }

  const subscriptions = (data ?? []) as PushSubscriptionRow[];
  if (subscriptions.length === 0) {
    console.warn("[web-push] No subscriptions for user", userId);
    return;
  }

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/dashboard/booking-requests",
    icon: "/icon",
  });

  const expiredIds: string[] = [];
  let sent = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          message
        );
        sent += 1;
      } catch (err) {
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? Number((err as { statusCode?: number }).statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          expiredIds.push(sub.id);
          return;
        }

        console.error("[web-push] send failed:", err);
      }
    })
  );

  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  console.info(
    `[web-push] Sent ${sent}/${subscriptions.length} for user ${userId}`
  );
}
