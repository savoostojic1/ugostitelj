import "server-only";

import { timingSafeEqual } from "crypto";
import {
  loadAdminAuth,
  resolveAdminUsername,
  DEFAULT_ADMIN_USERNAME,
} from "@/lib/admin/auth-store";
import {
  hashAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin/password";

export { DEFAULT_ADMIN_USERNAME } from "@/lib/admin/auth-store";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function envPasswordConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PANEL_PASSWORD ||
      process.env.CRON_SECRET?.trim()
  );
}

export async function adminPanelConfigured(): Promise<boolean> {
  const stored = await loadAdminAuth();
  if (stored) return true;
  return envPasswordConfigured();
}

export async function adminSetupRequired(): Promise<boolean> {
  const stored = await loadAdminAuth();
  if (stored) return false;
  return !envPasswordConfigured();
}

export async function getAdminUsername(): Promise<string> {
  const stored = await loadAdminAuth();
  if (stored) return resolveAdminUsername(stored);
  return process.env.ADMIN_PANEL_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
}

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const stored = await loadAdminAuth();

  if (stored) {
    return (
      safeEqual(username.trim(), stored.username) &&
      verifyAdminPassword(password, stored.password_hash)
    );
  }

  const expectedUser =
    process.env.ADMIN_PANEL_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
  const expectedPass =
    process.env.ADMIN_PANEL_PASSWORD ?? process.env.CRON_SECRET?.trim();

  if (!expectedPass) return false;

  return (
    safeEqual(username.trim(), expectedUser) && safeEqual(password, expectedPass)
  );
}

export async function setupAdminCredentials(input: {
  username: string;
  password: string;
}): Promise<void> {
  const { saveInitialAdminAuth } = await import("@/lib/admin/auth-store");
  const { generateSessionSecret } = await import("@/lib/admin/password");

  await saveInitialAdminAuth({
    username: input.username,
    passwordHash: hashAdminPassword(input.password),
    sessionSecret: generateSessionSecret(),
  });
}

export { hashAdminPassword, verifyAdminPassword };
