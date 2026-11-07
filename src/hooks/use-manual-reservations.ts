"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currencyCodeFromUnknown } from "@/lib/currency/currencies";
import { priceSnapshotFromStay } from "@/lib/currency/format";
import { countStayNights } from "@/lib/public/stay-price";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import { requireDashboardContext } from "@/lib/team-access/dashboard-context";
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
      const { hostId } = await requireDashboardContext(supabase);

      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("id, name")
        .eq("user_id", hostId);

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
        properties: { name: nameById[r.property_id] ?? "Property" },
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

      if (error || !data) throw new Error("Reservation not found");

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
        .select("id, currency_code")
        .eq("id", input.property_id)
        .eq("user_id", user.id)
        .single();

      if (propError || !property) throw new Error("Property not found");

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

      const snapshot = priceSnapshotFromStay({
        currencyCode: currencyCodeFromUnknown(property.currency_code),
        totalAmount: input.price,
        nights: countStayNights(input.check_in, input.check_out),
      });

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
          price: snapshot.total_amount,
          currency_code: snapshot.currency_code,
          nightly_rate: snapshot.nightly_rate,
          total_amount: snapshot.total_amount,
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
        .select("id, is_manual, property_id, currency_code")
        .eq("id", input.id)
        .single();

      if (fetchError || !existingReservation?.is_manual) {
        throw new Error("Reservation not found");
      }

      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("id", input.property_id)
        .eq("user_id", user.id)
        .single();

      if (propError || !property) throw new Error("Property not found");

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

      const snapshot = priceSnapshotFromStay({
        currencyCode: currencyCodeFromUnknown(existingReservation.currency_code),
        totalAmount: input.price,
        nights: countStayNights(input.check_in, input.check_out),
      });

      const { data, error } = await supabase
        .from("reservations")
        .update({
          property_id: input.property_id,
          title: input.title.trim(),
          check_in: input.check_in,
          check_out: input.check_out,
          source: input.source.trim(),
          guest_phone: input.guest_phone?.trim() || null,
          price: snapshot.total_amount,
          nightly_rate: snapshot.nightly_rate,
          total_amount: snapshot.total_amount,
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
      const response = await fetch(`/api/reservations/${id}/cancel`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        outcome?: string;
        guestEmail?: "sent" | "failed" | "skipped" | "duplicate";
      } | null;

      if (!response.ok || !body?.ok) {
        throw new Error(body?.error || "Could not cancel this reservation");
      }

      return {
        outcome: body.outcome ?? "deleted",
        guestEmail: body.guestEmail ?? "skipped",
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["booking-requests"] });
    },
  });
}
