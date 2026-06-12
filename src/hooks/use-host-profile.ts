"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getDashboardContext } from "@/lib/team-access/dashboard-context";
import { isValidUsername, suggestUsernameFromEmail } from "@/lib/public/slug";
import type { HostProfile } from "@/types/database";

const QUERY_KEY = ["host-profile"] as const;

export type HostProfileUpdate = {
  username: string;
  business_name: string;
  cover_image_url?: string | null;
  logo_url?: string | null;
  map_embed_url?: string | null;
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  location?: string | null;
  social_links?: Record<string, string>;
  is_published: boolean;
};

export function useHostProfile() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const context = await getDashboardContext(supabase);
      if (!context) throw new Error("Unauthorized");

      const profileId = context.hostId;

      const { data, error } = await supabase
        .from("host_profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return {
          ...(data as HostProfile),
          social_links:
            (data.social_links as Record<string, string> | null) ?? {},
        };
      }

      if (!context.isOwner) {
        return null;
      }

      const user = context.user;
      const username = suggestUsernameFromEmail(user.email ?? "host");
      const { data: created, error: insertError } = await supabase
        .from("host_profiles")
        .insert({
          id: profileId,
          username,
          business_name: user.user_metadata?.full_name ?? username,
          is_published: false,
        })
        .select("*")
        .single();

      if (insertError) throw insertError;
      return {
        ...(created as HostProfile),
        social_links: {},
      };
    },
  });
}

export function useUpdateHostProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: HostProfileUpdate) => {
      const supabase = createClient();
      const context = await getDashboardContext(supabase);
      if (!context?.isOwner) throw new Error("Forbidden");

      const username = input.username.trim().toLowerCase();
      if (!isValidUsername(username)) {
        throw new Error("Username must be 2–50 characters (lowercase letters, numbers, hyphens)");
      }

      const payload: Record<string, unknown> = {
        username,
        business_name: input.business_name.trim(),
        cover_image_url: input.cover_image_url?.trim() || null,
        description: input.description?.trim() || null,
        contact_email: input.contact_email?.trim() || null,
        contact_phone: input.contact_phone?.trim() || null,
        location: input.location?.trim() || null,
        social_links: input.social_links ?? {},
        is_published: input.is_published,
      };

      if (input.logo_url !== undefined) {
        payload.logo_url = input.logo_url?.trim() || null;
      }
      if (input.map_embed_url !== undefined) {
        payload.map_embed_url = input.map_embed_url?.trim() || null;
      }

      const { data, error } = await supabase
        .from("host_profiles")
        .update(payload)
        .eq("id", context.hostId)
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("That username is already taken");
        }
        throw error;
      }

      return data as HostProfile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
