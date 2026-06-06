"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { requireUser } from "@/lib/supabase/require-user";
import type {
  SavedMessage,
  SavedMessageInsert,
  SavedMessageUpdate,
} from "@/types/database";

const QUERY_KEY = ["saved-messages"] as const;

export function useSavedMessages() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { data, error } = await supabase
        .from("saved_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as SavedMessage[];
    },
  });
}

export function useCreateSavedMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SavedMessageInsert) => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const name = input.name.trim();
      const body = input.body.trim();
      if (!name) throw new Error("Unesi naziv poruke");
      if (!body) throw new Error("Unesi tekst poruke");

      const { data, error } = await supabase
        .from("saved_messages")
        .insert({ user_id: user.id, name, body })
        .select("*")
        .single();

      if (error) throw error;
      return data as SavedMessage;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateSavedMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SavedMessageUpdate) => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const name = input.name.trim();
      const body = input.body.trim();
      if (!name) throw new Error("Unesi naziv poruke");
      if (!body) throw new Error("Unesi tekst poruke");

      const { data, error } = await supabase
        .from("saved_messages")
        .update({ name, body })
        .eq("id", input.id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error || !data) throw new Error("Poruka nije pronađena");
      return data as SavedMessage;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteSavedMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const user = await requireUser(supabase);

      const { error } = await supabase
        .from("saved_messages")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
