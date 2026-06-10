"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import type { BookingRequest, BookingRequestStatus } from "@/types/database";

const QUERY_KEY = ["booking-requests"] as const;

export function useBookingRequests() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { data, error } = await supabase
        .from("booking_requests")
        .select("*, properties(name, slug)")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as BookingRequest[];
    },
  });
}

export function useUpdateBookingRequestStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: BookingRequestStatus;
    }) => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { data, error } = await supabase
        .from("booking_requests")
        .update({ status })
        .eq("id", id)
        .eq("host_id", user.id)
        .select("*")
        .single();

      if (error || !data) throw new Error("Zahtjev nije pronađen");
      return data as BookingRequest;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
