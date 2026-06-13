import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

export const DEFAULT_ADMIN_USERNAME = "admin-savo";

export type AdminAuthRecord = {
  username: string;
  password_hash: string;
  session_secret: string;
};

export async function loadAdminAuth(): Promise<AdminAuthRecord | null> {
  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return null;
  }

  const { data, error } = await admin
    .from("admin_panel_auth")
    .select("username, password_hash, session_secret")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function saveInitialAdminAuth(input: {
  username: string;
  passwordHash: string;
  sessionSecret: string;
}): Promise<void> {
  const admin = createServiceClient();

  const { data: existing } = await admin
    .from("admin_panel_auth")
    .select("id")
    .eq("id", 1)
    .maybeSingle();

  if (existing) {
    throw new Error("Admin password is already configured");
  }

  const { error } = await admin.from("admin_panel_auth").insert({
    id: 1,
    username: input.username,
    password_hash: input.passwordHash,
    session_secret: input.sessionSecret,
  });

  if (error) throw error;
}

export function resolveAdminUsername(record: AdminAuthRecord | null): string {
  return record?.username ?? DEFAULT_ADMIN_USERNAME;
}
