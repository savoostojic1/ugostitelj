import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasProAccess, isSubscriptionCanceling } from "@/lib/subscriptions/access";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";
import {
  loadHostSubscription,
  resolveBillingHostId,
} from "@/lib/subscriptions/resolve-host-subscription";
import { syncHostBillingFromStripe } from "@/lib/stripe/sync-host-billing";
import { hasStripeSecretKey } from "@/lib/stripe/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hostId, isOwner } = await resolveBillingHostId(supabase, user.id);
  if (!isOwner) {
    return NextResponse.json(
      { error: "Only the account owner can sync billing" },
      { status: 403 }
    );
  }

  if (await hasStripeSecretKey()) {
    try {
      await syncHostBillingFromStripe(hostId);
    } catch (err) {
      console.error("[billing sync]", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Could not sync billing from Stripe",
        },
        { status: 500 }
      );
    }
  }

  const subscription = await loadHostSubscription(supabase, hostId);
  const pro = hasProAccess(subscription);

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", hostId);

  return NextResponse.json({
    ok: true,
    isPro: pro,
    isCanceling: isSubscriptionCanceling(subscription, pro),
    subscriptionStatus: subscription?.subscription_status ?? "free",
    currentPeriodEnd: subscription?.subscription_current_period_end ?? null,
    propertyCount: count ?? 0,
    freeLimit: FREE_PROPERTY_LIMIT,
  });
}
