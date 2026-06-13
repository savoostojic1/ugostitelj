import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { summarizeAdminPlan } from "@/lib/admin/plan-summary";
import { hasProAccess } from "@/lib/subscriptions/access";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";
import { toSubscriptionRecord } from "@/lib/subscriptions/resolve-host-subscription";
import { createServiceClient } from "@/lib/supabase/service";

export type AdminHostRow = {
  id: string;
  email: string | null;
  username: string | null;
  business_name: string | null;
  is_published: boolean;
  property_count: number;
  subscription_status: SubscriptionStatus;
  subscription_current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  pro_access_granted: boolean;
  pro_access_granted_at: string | null;
  pro_access_granted_note: string | null;
  is_pro: boolean;
  has_host_profile: boolean;
  free_limit: number;
  can_add_property: boolean;
  requires_upgrade: boolean;
  plan_label: string;
  plan_source: "complimentary" | "stripe" | "free";
  created_at: string | null;
  last_sign_in_at: string | null;
};

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  let admin;
  try {
    admin = createServiceClient();
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Service client unavailable",
      },
      { status: 500 }
    );
  }

  const authUsers: {
    id: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
  }[] = [];

  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    authUsers.push(...data.users);
    if (data.users.length < 200) break;
    page += 1;
  }

  const { data: profiles, error: profilesError } = await admin
    .from("host_profiles")
    .select(
      "id, username, business_name, is_published, subscription_status, subscription_current_period_end, stripe_customer_id, stripe_subscription_id, pro_access_granted, pro_access_granted_at, pro_access_granted_note, created_at"
    );

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const { data: teamRows, error: teamError } = await admin
    .from("team_access_users")
    .select("auth_user_id");

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  const { data: properties, error: propertiesError } = await admin
    .from("properties")
    .select("user_id");

  if (propertiesError) {
    return NextResponse.json(
      { error: propertiesError.message },
      { status: 500 }
    );
  }

  const propertyCounts = new Map<string, number>();
  for (const row of properties ?? []) {
    propertyCounts.set(row.user_id, (propertyCounts.get(row.user_id) ?? 0) + 1);
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const teamAuthIds = new Set((teamRows ?? []).map((row) => row.auth_user_id));

  const hosts: AdminHostRow[] = authUsers
    .filter((user) => !teamAuthIds.has(user.id))
    .map((user) => {
      const profile = profileById.get(user.id);
      const subscription = toSubscriptionRecord(
        profile
          ? {
              subscription_status: profile.subscription_status as SubscriptionStatus | null,
              subscription_current_period_end:
                profile.subscription_current_period_end,
              stripe_customer_id: profile.stripe_customer_id,
              stripe_subscription_id: profile.stripe_subscription_id,
              pro_access_granted: profile.pro_access_granted ?? false,
            }
          : null
      );

      const propertyCount = propertyCounts.get(user.id) ?? 0;
      const isPro = hasProAccess(subscription);
      const billing = {
        id: user.id,
        email: user.email ?? null,
        username: profile?.username ?? null,
        property_count: propertyCount,
        subscription_status: (profile?.subscription_status ??
          "free") as SubscriptionStatus,
        subscription_current_period_end:
          profile?.subscription_current_period_end ?? null,
        stripe_customer_id: profile?.stripe_customer_id ?? null,
        stripe_subscription_id: profile?.stripe_subscription_id ?? null,
        pro_access_granted: profile?.pro_access_granted ?? false,
        pro_access_granted_at: profile?.pro_access_granted_at ?? null,
        pro_access_granted_note: profile?.pro_access_granted_note ?? null,
        is_pro: isPro,
        has_host_profile: Boolean(profile),
      };

      const summary = summarizeAdminPlan(billing);

      return {
        ...billing,
        business_name: profile?.business_name ?? null,
        is_published: profile?.is_published ?? false,
        free_limit: FREE_PROPERTY_LIMIT,
        can_add_property: summary.canAddProperty,
        requires_upgrade: summary.requiresUpgrade,
        plan_label: summary.planLabel,
        plan_source: summary.planSource,
        created_at: profile?.created_at ?? user.created_at ?? null,
        last_sign_in_at: user.last_sign_in_at ?? null,
      };
    });

  hosts.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  const stats = {
    totalUsers: hosts.length,
    withProfile: hosts.filter((h) => h.has_host_profile).length,
    published: hosts.filter((h) => h.is_published).length,
    pro: hosts.filter((h) => h.is_pro).length,
    complimentary: hosts.filter((h) => h.pro_access_granted).length,
    stripePro: hosts.filter((h) => h.plan_source === "stripe" && h.is_pro).length,
    totalProperties: hosts.reduce((sum, h) => sum + h.property_count, 0),
  };

  return NextResponse.json({ hosts, stats });
}
