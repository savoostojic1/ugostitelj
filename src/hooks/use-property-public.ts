"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import { isValidSlug, suggestPropertySlug } from "@/lib/public/slug";
import type { Property } from "@/types/database";

export type PropertyPublicUpdate = {
  id: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  capacity?: number | null;
  amenities?: string[];
  house_rules?: string | null;
  starting_price?: number | null;
  gallery_urls?: string[];
  is_public: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
};

export function useUpdatePropertyPublic() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: PropertyPublicUpdate) => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const slug = input.slug.trim().toLowerCase();
      if (input.is_public && !isValidSlug(slug)) {
        throw new Error(
          "URL slug mora biti 2–50 znakova (mala slova, brojevi, crtice)"
        );
      }

      const gallery_urls = (input.gallery_urls ?? []).slice(0, 10);

      const payload: Record<string, unknown> = {
        slug: input.is_public ? slug : slug || null,
        short_description: input.short_description?.trim() || null,
        capacity: input.capacity ?? null,
        amenities: input.amenities ?? [],
        gallery_urls,
        image_url: gallery_urls[0] ?? null,
        is_public: input.is_public,
        seo_title: input.seo_title?.trim() || null,
        seo_description: input.seo_description?.trim() || null,
      };

      if (input.description !== undefined) {
        payload.description = input.description?.trim() || null;
      }
      if (input.house_rules !== undefined) {
        payload.house_rules = input.house_rules?.trim() || null;
      }
      if (input.starting_price !== undefined) {
        payload.starting_price = input.starting_price;
      }

      const { data, error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", input.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Taj URL slug je već zauzet");
        }
        throw error;
      }

      return data as Property;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["properties", data.id] });
    },
  });
}

export { suggestPropertySlug };
