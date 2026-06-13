import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  canAddProperty,
  requiresUpgradeForPropertyCount,
} from "@/lib/subscriptions/access";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: teamRow } = await supabase
    .from("team_access_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (teamRow) {
    return NextResponse.json(
      { error: "Only the account owner can add properties" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Property name is required" }, { status: 400 });
  }

  const { count, error: countError } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const { data: billing } = await supabase
    .from("host_profiles")
    .select(
      "subscription_status, subscription_current_period_end, pro_access_granted"
    )
    .eq("id", user.id)
    .maybeSingle();

  const subscription = billing
    ? {
        subscription_status: billing.subscription_status as SubscriptionStatus,
        subscription_current_period_end:
          billing.subscription_current_period_end,
        pro_access_granted: billing.pro_access_granted ?? false,
      }
    : null;

  const currentCount = count ?? 0;

  if (requiresUpgradeForPropertyCount(currentCount, subscription)) {
    return NextResponse.json(
      {
        error: "Upgrade required",
        upgradeRequired: true,
        propertyCount: currentCount,
      },
      { status: 402 }
    );
  }

  if (!canAddProperty(currentCount, subscription)) {
    return NextResponse.json(
      { error: "Property limit reached", upgradeRequired: true },
      { status: 402 }
    );
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({ user_id: user.id, name })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ property: data });
}
