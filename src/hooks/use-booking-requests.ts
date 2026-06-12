"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import { requireDashboardContext } from "@/lib/team-access/dashboard-context";
import type { BookingRequest } from "@/types/database";

const QUERY_KEY = ["booking-requests"] as const;

function mapBookingRequestError(message: string): string {
  if (message.includes("no longer available")) {
    return "These dates are no longer available. Reject the inquiry or contact the guest.";
  }
  if (message.includes("not found") || message.includes("already processed")) {
    return "This inquiry was already handled.";
  }
  return message;
}

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

export function useAcceptBookingRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      await requireUser(supabase);

      const { data, error } = await supabase.rpc("accept_booking_request", {
        p_request_id: id,
      });

      if (error) {
        throw new Error(mapBookingRequestError(error.message));
      }

      return data as string;
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
      const supabase = createClient();
      await requireUser(supabase);

      const { error } = await supabase.rpc("reject_booking_request", {
        p_request_id: id,
      });

      if (error) {
        throw new Error(mapBookingRequestError(error.message));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
