import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasProAccess, isSubscriptionCanceling } from "@/lib/subscriptions/access";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";
import {
  loadHostSubscription,
  resolveBillingHostId,
} from "@/lib/subscriptions/resolve-host-subscription";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hostId, isOwner } = await resolveBillingHostId(supabase, user.id);

  const { count, error: countError } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", hostId);

  if (countError) {
    return NextResponse.json({ error: "Could not load usage" }, { status: 500 });
  }

  const subscription = await loadHostSubscription(supabase, hostId);
  const pro = hasProAccess(subscription);
  const propertyCount = count ?? 0;
  const isCanceling = isSubscriptionCanceling(subscription, pro);

  return NextResponse.json({
    isOwner,
    inheritsHostPlan: !isOwner,
    propertyCount,
    freeLimit: FREE_PROPERTY_LIMIT,
    isPro: pro,
    isCanceling,
    isComplimentary: Boolean(subscription?.pro_access_granted),
    subscriptionStatus: subscription?.subscription_status ?? "free",
    currentPeriodEnd: subscription?.subscription_current_period_end ?? null,
    canManageSubscription:
      isOwner &&
      !subscription?.pro_access_granted &&
      Boolean(subscription?.stripe_customer_id) &&
      Boolean(subscription?.stripe_subscription_id),
    canAddProperty: isOwner && (pro || propertyCount < FREE_PROPERTY_LIMIT),
    requiresUpgrade:
      isOwner && !pro && propertyCount >= FREE_PROPERTY_LIMIT,
  });
}
