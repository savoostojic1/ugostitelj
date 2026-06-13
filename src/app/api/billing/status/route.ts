import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasProAccess, isSubscriptionCanceling } from "@/lib/subscriptions/access";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";
import {
  countLockedProperties,
  getAllowedPropertyIds,
} from "@/lib/subscriptions/property-access";
import {
  loadHostSubscription,
  resolveBillingHostId,
} from "@/lib/subscriptions/resolve-host-subscription";
import { syncHostBillingFromStripe } from "@/lib/stripe/sync-host-billing";
import { isTestHostId, loadStripeAppIdentity } from "@/lib/stripe/app-identity";
import { hasStripeSecretKey } from "@/lib/stripe/stripe";

async function buildBillingStatusResponse(
  supabase: Awaited<ReturnType<typeof createClient>>,
  hostId: string,
  isOwner: boolean
) {
  const { count, error: countError } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", hostId);

  if (countError) {
    throw new Error("Could not load usage");
  }

  const subscription = await loadHostSubscription(supabase, hostId);
  const pro = hasProAccess(subscription);
  const propertyCount = count ?? 0;
  const isCanceling = isSubscriptionCanceling(subscription, pro);

  const { data: propertyRows, error: propertyRowsError } = await supabase
    .from("properties")
    .select("id, created_at")
    .eq("user_id", hostId);

  if (propertyRowsError) {
    throw new Error("Could not load properties");
  }

  const allowedPropertyIds = getAllowedPropertyIds(
    propertyRows ?? [],
    subscription
  );
  const lockedPropertyCount = countLockedProperties(propertyCount, subscription);
  const identity = await loadStripeAppIdentity();

  return {
    isOwner,
    inheritsHostPlan: !isOwner,
    propertyCount,
    freeLimit: FREE_PROPERTY_LIMIT,
    isPro: pro,
    isCanceling,
    isComplimentary: Boolean(subscription?.pro_access_granted),
    isTestBillingUser: isTestHostId(hostId, identity),
    stripeMode: identity.stripeMode,
    subscriptionStatus: subscription?.subscription_status ?? "free",
    currentPeriodEnd: subscription?.subscription_current_period_end ?? null,
    allowedPropertyIds,
    lockedPropertyCount,
    canManageSubscription:
      isOwner &&
      !subscription?.pro_access_granted &&
      Boolean(subscription?.stripe_customer_id) &&
      Boolean(subscription?.stripe_subscription_id),
    canAddProperty: isOwner && (pro || propertyCount < FREE_PROPERTY_LIMIT),
    requiresUpgrade:
      isOwner && !pro && propertyCount >= FREE_PROPERTY_LIMIT,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hostId, isOwner } = await resolveBillingHostId(supabase, user.id);

  if (isOwner && (await hasStripeSecretKey())) {
    try {
      await syncHostBillingFromStripe(hostId);
    } catch (err) {
      console.error("[billing status sync]", err);
    }
  }

  try {
    const payload = await buildBillingStatusResponse(supabase, hostId, isOwner);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not load billing status",
      },
      { status: 500 }
    );
  }
}
