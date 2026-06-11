"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import type { PropertyPriceRule } from "@/types/database";

export function usePropertyPriceRules(propertyId: string) {
  return useQuery({
    queryKey: ["property_price_rules", propertyId],
    queryFn: async () => {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", propertyId)
        .eq("user_id", user.id)
        .single();
      if (propError || !property) throw new Error("Property not found");

      const { data, error } = await supabase
        .from("property_price_rules")
        .select("*")
        .eq("property_id", propertyId)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as PropertyPriceRule[];
    },
    enabled: !!propertyId,
  });
}

interface CreatePriceRuleInput {
  propertyId: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
}

export function useCreatePropertyPriceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      startDate,
      endDate,
      pricePerNight,
    }: CreatePriceRuleInput) => {
      if (endDate < startDate) {
        throw new Error("End date must be after start date");
      }
      if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
        throw new Error("Enter a valid price");
      }

      const supabase = createClient();
      const user = await requireUser(supabase);
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", propertyId)
        .eq("user_id", user.id)
        .single();
      if (propError || !property) throw new Error("Property not found");

      const { data, error } = await supabase
        .from("property_price_rules")
        .insert({
          property_id: propertyId,
          start_date: startDate,
          end_date: endDate,
          price_per_night: pricePerNight,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PropertyPriceRule;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["property_price_rules", variables.propertyId],
      });
    },
  });
}

export function useUpdatePropertyStartingPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      startingPrice,
    }: {
      propertyId: string;
      startingPrice: number | null;
    }) => {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const { error } = await supabase
        .from("properties")
        .update({ starting_price: startingPrice })
        .eq("id", propertyId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({
        queryKey: ["properties", variables.propertyId],
      });
    },
  });
}

export function useDeletePropertyPriceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      propertyId,
    }: {
      id: string;
      propertyId: string;
    }) => {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", propertyId)
        .eq("user_id", user.id)
        .single();
      if (propError || !property) throw new Error("Property not found");

      const { error } = await supabase
        .from("property_price_rules")
        .delete()
        .eq("id", id)
        .eq("property_id", propertyId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["property_price_rules", variables.propertyId],
      });
    },
  });
}
