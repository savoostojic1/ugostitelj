"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { requireDashboardContext } from "@/lib/team-access/dashboard-context";
import type { BookingRequest } from "@/types/database";

const QUERY_KEY = ["booking-requests"] as const;

export function useBookingRequests() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { hostId } = await requireDashboardContext(supabase);

      const { data, error } = await supabase
        .from("booking_requests")
        .select("*, properties(name, slug)")
        .eq("host_id", hostId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as BookingRequest[];
    },
  });
}

export type BookingRequestHistoryItem = {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  status: BookingRequest["status"];
  cancelled_at: string | null;
  cancelled_by: "guest" | "owner" | null;
  updated_at: string;
  properties?: { name: string } | { name: string }[] | null;
};

export function useBookingRequestHistory() {
  return useQuery({
    queryKey: [...QUERY_KEY, "history"],
    queryFn: async () => {
      const supabase = createClient();
      const { hostId } = await requireDashboardContext(supabase);

      const { data, error } = await supabase
        .from("booking_requests")
        .select(
          "id, guest_name, check_in, check_out, guest_count, status, cancelled_at, cancelled_by, updated_at, properties(name)"
        )
        .eq("host_id", hostId)
        .in("status", ["cancelled", "rejected"])
        .order("updated_at", { ascending: false })
        .limit(30);

      if (error) return [] as BookingRequestHistoryItem[];
      return (data ?? []) as BookingRequestHistoryItem[];
    },
  });
}

export function useAcceptBookingRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/booking-requests/${id}/accept`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        reservationId?: string | null;
        guestEmail?: "sent" | "failed" | "skipped" | "duplicate";
      } | null;

      if (!response.ok || !body?.ok) {
        throw new Error(body?.error || "Could not accept");
      }

      return {
        reservationId: body.reservationId ?? null,
        guestEmail: body.guestEmail ?? "skipped",
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useRejectBookingRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/booking-requests/${id}/reject`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !body?.ok) {
        throw new Error(body?.error || "Could not reject");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
