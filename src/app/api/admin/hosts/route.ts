import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { hasProAccess } from "@/lib/subscriptions/access";
import type { SubscriptionStatus } from "@/lib/subscriptions/plans";
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

  const hosts: AdminHostRow[] = authUsers.map((user) => {
    const profile = profileById.get(user.id);
    const subscription = profile
      ? {
          subscription_status: (profile.subscription_status ??
            "free") as SubscriptionStatus,
          subscription_current_period_end: null,
          pro_access_granted: profile.pro_access_granted ?? false,
        }
      : null;

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
    totalProperties: hosts.reduce((sum, h) => sum + h.property_count, 0),
  };

  return NextResponse.json({ hosts, stats });
}
