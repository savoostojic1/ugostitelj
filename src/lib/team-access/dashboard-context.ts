import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import {
  ALL_TEAM_PERMISSIONS,
  normalizeTeamPermissions,
  type TeamPermission,
} from "@/lib/team-access/permissions";

export type TeamAccessUser = {
  id: string;
  host_id: string;
  auth_user_id: string;
  username: string;
  login_email: string;
  display_name: string | null;
  password_plain: string | null;
  permissions: TeamPermission[];
  created_at: string;
  updated_at: string;
};

export type DashboardContext = {
  user: User;
  isOwner: boolean;
  hostId: string;
  permissions: TeamPermission[];
  teamAccess: TeamAccessUser | null;
};

export async function getDashboardContext(
  supabase: SupabaseClient
): Promise<DashboardContext | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: teamRow, error: teamError } = await supabase
    .from("team_access_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (teamError) throw teamError;

  if (teamRow) {
    return {
      user,
      isOwner: false,
      hostId: teamRow.host_id,
      permissions: normalizeTeamPermissions(teamRow.permissions),
      teamAccess: {
        ...teamRow,
        permissions: normalizeTeamPermissions(teamRow.permissions),
      },
    };
  }

  return {
    user,
    isOwner: true,
    hostId: user.id,
    permissions: ALL_TEAM_PERMISSIONS,
    teamAccess: null,
  };
}

export async function requireDashboardContext(
  supabase: SupabaseClient
): Promise<DashboardContext> {
  const context = await getDashboardContext(supabase);
  if (!context) {
    throw new Error("Unauthorized");
  }
  return context;
}
