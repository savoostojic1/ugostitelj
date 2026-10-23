import "server-only";

import { NextResponse } from "next/server";
import { authorizeCreemBillingAction, type CreemBillingAction } from "@/lib/creem/authorize-billing";
import { readCreemConfig, type CreemConfig } from "@/lib/creem/config";
import { createClient } from "@/lib/supabase/server";
import { resolveBillingHostId } from "@/lib/subscriptions/resolve-host-subscription";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";

export type OwnerBillingContext = {
  hostId: string;
  config: CreemConfig;
  creemCustomerId: string | null;
  creemSubscriptionId: string | null;
  complimentary: boolean;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
};

export async function requireCreemBillingOwner(
  action: CreemBillingAction
): Promise<{ ok: true; context: OwnerBillingContext } | { ok: false; response: NextResponse }> {
  let config: CreemConfig;
  try {
    config = readCreemConfig();
  } catch (err) {
    console.error("[creem billing] configuration", err);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Creem is not configured." },
        { status: 503 }
      ),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { hostId, isOwner } = user
    ? await resolveBillingHostId(supabase, user.id)
    : { hostId: "", isOwner: false };

  const { data: profile } = user
    ? await supabase
        .from("host_profiles")
        .select(
          "creem_customer_id, creem_subscription_id, pro_access_granted, subscription_status, subscription_current_period_end"
        )
        .eq("id", hostId || user.id)
        .maybeSingle()
    : { data: null };

  const decision = authorizeCreemBillingAction({
    userId: user?.id ?? null,
    isOwner: Boolean(user) && isOwner,
    apiKeyConfigured: Boolean(config.apiKey),
    complimentary: Boolean(profile?.pro_access_granted),
    creemCustomerId: profile?.creem_customer_id ?? null,
    creemSubscriptionId: profile?.creem_subscription_id ?? null,
    action,
  });

  if (!decision.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: decision.error },
        { status: decision.status }
      ),
    };
  }

  return {
    ok: true,
    context: {
      hostId,
      config,
      creemCustomerId: profile?.creem_customer_id ?? null,
      creemSubscriptionId: profile?.creem_subscription_id ?? null,
      complimentary: Boolean(profile?.pro_access_granted),
      subscriptionStatus: (profile?.subscription_status ?? "free") as SubscriptionStatus,
      currentPeriodEnd: profile?.subscription_current_period_end ?? null,
    },
  };
}
