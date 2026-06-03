"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import type {
  ManualReservationInsert,
  ManualReservationUpdate,
  Reservation,
} from "@/types/database";
import { validateStayRange } from "@/lib/reservations/availability";

export type ManualReservation = Reservation & {
  properties: { name: string };
};

export function useManualReservations() {
  return useQuery({
    queryKey: ["reservations", "manual"],
    queryFn: async () => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("id, name")
        .eq("user_id", user.id);

      if (propError) throw propError;
      if (!properties?.length) return [] as ManualReservation[];

      const nameById = Object.fromEntries(
        properties.map((p) => [p.id, p.name])
      );
      const propertyIds = properties.map((p) => p.id);

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .in("property_id", propertyIds)
        .eq("is_manual", true)
        .order("check_in", { ascending: false });

      if (error) throw error;

      return (data as Reservation[]).map((r) => ({
        ...r,
        properties: { name: nameById[r.property_id] ?? "Nekretnina" },
      }));
    },
  });
}

export function useManualReservation(id: string) {
  return useQuery({
    queryKey: ["reservations", "manual", id],
    enabled: !!id,
    queryFn: async () => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", id)
        .eq("is_manual", true)
        .single();

      if (error || !data) throw new Error("Rezervacija nije pronađena");

      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id, name")
        .eq("id", data.property_id)
        .eq("user_id", user.id)
        .single();

      if (propError || !property) throw new Error("Nemate pristup ovoj rezervaciji");

      return {
        ...(data as Reservation),
        properties: { name: property.name },
      } as ManualReservation;
    },
  });
}

export function useCreateManualReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: ManualReservationInsert) => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", input.property_id)
        .eq("user_id", user.id)
        .single();

      if (propError || !property) throw new Error("Nekretnina nije pronađena");

      const { data: existing, error: existingError } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", input.property_id);

      if (existingError) throw existingError;

      const validation = validateStayRange(
        (existing ?? []) as Reservation[],
        input.check_in,
        input.check_out
      );
      if (!validation.ok) {
        throw new Error(validation.message);
      }

      const { data, error } = await supabase
        .from("reservations")
        .insert({
          property_id: input.property_id,
          user_id: user.id,
          calendar_feed_id: null,
          external_uid: `manual-${crypto.randomUUID()}`,
          title: input.title.trim(),
          check_in: input.check_in,
          check_out: input.check_out,
          platform: "custom",
          is_manual: true,
          source: input.source.trim(),
          guest_phone: input.guest_phone?.trim() || null,
          price: input.price,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Reservation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useUpdateManualReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: ManualReservationUpdate) => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { data: existingReservation, error: fetchError } = await supabase
        .from("reservations")
        .select("id, is_manual, property_id")
        .eq("id", input.id)
        .single();

      if (fetchError || !existingReservation?.is_manual) {
        throw new Error("Rezervacija nije pronađena");
      }

      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", input.property_id)
        .eq("user_id", user.id)
        .single();

      if (propError || !property) throw new Error("Nekretnina nije pronađena");

      const { data: existing, error: existingError } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", input.property_id);

      if (existingError) throw existingError;

      const validation = validateStayRange(
        (existing ?? []) as Reservation[],
        input.check_in,
        input.check_out,
        { excludeId: input.id, allowPastCheckIn: true }
      );
      if (!validation.ok) {
        throw new Error(validation.message);
      }

      const { data, error } = await supabase
        .from("reservations")
        .update({
          property_id: input.property_id,
          title: input.title.trim(),
          check_in: input.check_in,
          check_out: input.check_out,
          source: input.source.trim(),
          guest_phone: input.guest_phone?.trim() || null,
          price: input.price,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data as Reservation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useDeleteManualReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { data: reservation, error: fetchError } = await supabase
        .from("reservations")
        .select("id, is_manual, property_id")
        .eq("id", id)
        .single();

      if (fetchError || !reservation?.is_manual) {
        throw new Error("Rezervacija nije pronađena");
      }

      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", reservation.property_id)
        .eq("user_id", user.id)
        .single();

      if (propError || !property) throw new Error("Nemate pristup ovoj rezervaciji");

      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
