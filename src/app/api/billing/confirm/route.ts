import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { confirmCheckoutSession } from "@/lib/stripe/confirm-checkout-session";
import { hasProAccess } from "@/lib/subscriptions/access";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";
import {
  loadHostSubscription,
  resolveBillingHostId,
} from "@/lib/subscriptions/resolve-host-subscription";

type Body = {
  sessionId?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  const sessionId = body.sessionId?.trim();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const { hostId, isOwner } = await resolveBillingHostId(supabase, user.id);
  if (!isOwner) {
    return NextResponse.json(
      { error: "Only the account owner can confirm billing" },
      { status: 403 }
    );
  }

  try {
    const result = await confirmCheckoutSession(sessionId, hostId);

    const subscription = await loadHostSubscription(supabase, hostId);
    const pro = hasProAccess(subscription);

    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("user_id", hostId);

    return NextResponse.json({
      ok: true,
      isPro: pro,
      subscriptionStatus: subscription?.subscription_status ?? "free",
      stripeSubscriptionId: result.subscriptionId,
      stripeStatus: result.subscriptionStatus,
      propertyCount: count ?? 0,
      freeLimit: FREE_PROPERTY_LIMIT,
    });
  } catch (err) {
    console.error("[billing confirm]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not confirm checkout session",
      },
      { status: 400 }
    );
  }
}
