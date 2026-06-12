"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getDashboardContext } from "@/lib/team-access/dashboard-context";
import type { TeamAccessUser } from "@/lib/team-access/dashboard-context";

const CONTEXT_KEY = ["dashboard-context"] as const;
const TEAM_LIST_KEY = ["team-access-users"] as const;

export function useDashboardContext() {
  return useQuery({
    queryKey: CONTEXT_KEY,
    queryFn: async () => {
      const supabase = createClient();
      return getDashboardContext(supabase);
    },
    staleTime: 30_000,
  });
}

export type TeamAccessList = {
  users: TeamAccessUser[];
  canCreateUsers: boolean;
};

export function useTeamAccessUsers() {
  return useQuery({
    queryKey: TEAM_LIST_KEY,
    queryFn: async () => {
      const res = await fetch("/api/team-access");
      const json = (await res.json()) as {
        users?: TeamAccessUser[];
        canCreateUsers?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Could not load team access");
      return {
        users: json.users ?? [],
        canCreateUsers: json.canCreateUsers ?? false,
      } satisfies TeamAccessList;
    },
  });
}

export { CONTEXT_KEY as DASHBOARD_CONTEXT_KEY, TEAM_LIST_KEY };
