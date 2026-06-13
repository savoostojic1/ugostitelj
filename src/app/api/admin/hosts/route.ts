import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { hasProAccess } from "@/lib/subscriptions/access";
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
  pro_access_granted: boolean;
  pro_access_granted_note: string | null;
  is_pro: boolean;
  has_host_profile: boolean;
  account_type: "owner" | "team";
  host_id: string | null;
  host_username: string | null;
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
      "id, username, business_name, is_published, subscription_status, pro_access_granted, pro_access_granted_note, created_at"
    );

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const { data: teamRows, error: teamError } = await admin
    .from("team_access_users")
    .select("auth_user_id, host_id, username, display_name");

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
  const teamByAuthId = new Map(
    (teamRows ?? []).map((row) => [row.auth_user_id, row])
  );

  function subscriptionForHost(hostId: string) {
    const profile = profileById.get(hostId);
    return toSubscriptionRecord(
      profile
        ? {
            subscription_status: profile.subscription_status as SubscriptionStatus | null,
            subscription_current_period_end: null,
            stripe_customer_id: null,
            pro_access_granted: profile.pro_access_granted ?? false,
          }
        : null
    );
  }

  const hosts: AdminHostRow[] = authUsers.map((user) => {
    const team = teamByAuthId.get(user.id);

    if (team) {
      const hostProfile = profileById.get(team.host_id);
      const subscription = subscriptionForHost(team.host_id);
      const pro = hasProAccess(subscription);

      return {
        id: user.id,
        email: user.email ?? null,
        username: team.username,
        business_name: team.display_name,
        is_published: hostProfile?.is_published ?? false,
        property_count: propertyCounts.get(team.host_id) ?? 0,
        subscription_status: (hostProfile?.subscription_status ??
          "free") as SubscriptionStatus,
        pro_access_granted: hostProfile?.pro_access_granted ?? false,
        pro_access_granted_note: hostProfile?.pro_access_granted_note ?? null,
        is_pro: pro,
        has_host_profile: Boolean(hostProfile),
        account_type: "team",
        host_id: team.host_id,
        host_username: hostProfile?.username ?? null,
        created_at: user.created_at ?? null,
        last_sign_in_at: user.last_sign_in_at ?? null,
      };
    }

    const profile = profileById.get(user.id);
    const subscription = subscriptionForHost(user.id);

    return {
      id: user.id,
      email: user.email ?? null,
      username: profile?.username ?? null,
      business_name: profile?.business_name ?? null,
      is_published: profile?.is_published ?? false,
      property_count: propertyCounts.get(user.id) ?? 0,
      subscription_status: (profile?.subscription_status ??
        "free") as SubscriptionStatus,
      pro_access_granted: profile?.pro_access_granted ?? false,
      pro_access_granted_note: profile?.pro_access_granted_note ?? null,
      is_pro: hasProAccess(subscription),
      has_host_profile: Boolean(profile),
      account_type: "owner",
      host_id: null,
      host_username: null,
      created_at: profile?.created_at ?? user.created_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
    };
  });

  hosts.sort((a, b) => {
    if (a.account_type !== b.account_type) {
      return a.account_type === "owner" ? -1 : 1;
    }
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  const owners = hosts.filter((h) => h.account_type === "owner");

  const stats = {
    totalUsers: owners.length,
    teamMembers: hosts.length - owners.length,
    withProfile: owners.filter((h) => h.has_host_profile).length,
    published: owners.filter((h) => h.is_published).length,
    pro: owners.filter((h) => h.is_pro).length,
    complimentary: owners.filter((h) => h.pro_access_granted).length,
    totalProperties: owners.reduce((sum, h) => sum + h.property_count, 0),
  };

  return NextResponse.json({ hosts, stats });
}
