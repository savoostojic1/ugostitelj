import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasProAccess } from "@/lib/subscriptions/access";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: teamRow } = await supabase
    .from("team_access_users")
    .select("host_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const hostId = teamRow?.host_id ?? user.id;
  const isOwner = !teamRow;

  const { count, error: countError } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", hostId);

  if (countError) {
    return NextResponse.json({ error: "Could not load usage" }, { status: 500 });
  }

  const { data: billing } = await supabase
    .from("host_profiles")
    .select(
      "subscription_status, subscription_current_period_end, stripe_customer_id, pro_access_granted"
    )
    .eq("id", hostId)
    .maybeSingle();

  const subscription = billing
    ? {
        subscription_status: billing.subscription_status as SubscriptionStatus,
        subscription_current_period_end:
          billing.subscription_current_period_end,
        stripe_customer_id: billing.stripe_customer_id,
        pro_access_granted: billing.pro_access_granted ?? false,
      }
    : null;

  const pro = hasProAccess(subscription);
  const propertyCount = count ?? 0;

  return NextResponse.json({
    isOwner,
    propertyCount,
    freeLimit: FREE_PROPERTY_LIMIT,
    isPro: pro,
    isComplimentary: Boolean(billing?.pro_access_granted),
    subscriptionStatus: subscription?.subscription_status ?? "free",
    currentPeriodEnd: subscription?.subscription_current_period_end ?? null,
    canAddProperty: pro || propertyCount < FREE_PROPERTY_LIMIT,
    requiresUpgrade: !pro && propertyCount >= FREE_PROPERTY_LIMIT,
  });
}
