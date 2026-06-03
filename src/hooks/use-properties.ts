"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import { postSyncAll } from "@/lib/sync/sync-all";
import type { CalendarFeed, Property, PropertyInsert, Reservation } from "@/types/database";

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: async () => {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data as Property;
    },
    enabled: !!id,
  });
}

export function usePropertyFeeds(propertyId: string) {
  return useQuery({
    queryKey: ["calendar_feeds", propertyId],
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
        .from("calendar_feeds")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CalendarFeed[];
    },
    enabled: !!propertyId,
  });
}

export function useReservations(
  propertyId?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: propertyId ? ["reservations", propertyId] : ["reservations"],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      let propertyQuery = supabase
        .from("properties")
        .select("id, name")
        .eq("user_id", user.id);

      if (propertyId) {
        propertyQuery = propertyQuery.eq("id", propertyId);
      }

      const { data: properties, error: propError } = await propertyQuery;
      if (propError) throw propError;
      if (!properties?.length) return [];

      const propertyIds = properties.map((p) => p.id);
      const nameById = Object.fromEntries(
        properties.map((p) => [p.id, p.name])
      );

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .in("property_id", propertyIds)
        .order("check_in", { ascending: true });

      if (error) throw error;

      return (data as Reservation[]).map((r) => ({
        ...r,
        properties: { name: nameById[r.property_id] ?? "Property" },
      }));
    },
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PropertyInsert & { user_id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Property;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const { data, error } = await supabase
        .from("properties")
        .update({ name: name.trim() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data as Property;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["properties", data.id] });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const user = await requireUser(supabase);
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.removeQueries({ queryKey: ["properties", id] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["calendar_feeds"] });
    },
  });
}

export function useSyncAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const json = await postSyncAll();
      const failed = json.results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error);
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar_feeds"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useSyncFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feedId: string) => {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync failed");
      const failed = (json.results as { error?: string }[] | undefined)?.find(
        (r) => r.error
      );
      if (failed?.error) throw new Error(failed.error);
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar_feeds"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
