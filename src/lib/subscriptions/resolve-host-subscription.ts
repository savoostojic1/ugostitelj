import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionRecord, SubscriptionStatus } from "@/lib/subscriptions/plans";

export type HostSubscriptionRow = {
  subscription_status: SubscriptionStatus | null;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
  stripe_subscription_id?: string | null;
  pro_access_granted: boolean | null;
};

export function toSubscriptionRecord(
  row: HostSubscriptionRow | null
): SubscriptionRecord | null {
  if (!row) return null;

  return {
    subscription_status: (row.subscription_status ?? "free") as SubscriptionStatus,
    subscription_current_period_end: row.subscription_current_period_end,
    subscription_cancel_at_period_end: row.subscription_cancel_at_period_end ?? false,
    stripe_customer_id: row.stripe_customer_id,
    stripe_subscription_id: row.stripe_subscription_id,
    pro_access_granted: row.pro_access_granted ?? false,
  };
}

export async function loadHostSubscription(
  supabase: SupabaseClient,
  hostId: string
): Promise<SubscriptionRecord | null> {
  const { data, error } = await supabase
    .from("host_profiles")
    .select(
      "subscription_status, subscription_current_period_end, subscription_cancel_at_period_end, stripe_customer_id, stripe_subscription_id, pro_access_granted"
    )
    .eq("id", hostId)
    .maybeSingle();

  if (error || !data) return null;
  return toSubscriptionRecord(data);
}

export async function resolveBillingHostId(
  supabase: SupabaseClient,
  userId: string
): Promise<{ hostId: string; isOwner: boolean }> {
  const { data: teamRow } = await supabase
    .from("team_access_users")
    .select("host_id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (teamRow) {
    return { hostId: teamRow.host_id, isOwner: false };
  }

  return { hostId: userId, isOwner: true };
}
