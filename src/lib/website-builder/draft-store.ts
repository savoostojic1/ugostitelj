import type { WebsiteDocument } from "@/lib/website-builder/types";

export interface StoredDraft {
  document: WebsiteDocument;
  updatedAt: string;
}

/** Prefer the newer copy. Equal timestamps keep the server copy. */
export function chooseDraft(local: StoredDraft | null, server: StoredDraft | null): StoredDraft | null {
  if (!local) return server;
  if (!server) return local;
  const localTime = Date.parse(local.updatedAt);
  const serverTime = Date.parse(server.updatedAt);
  if (!Number.isFinite(localTime)) return server;
  if (!Number.isFinite(serverTime)) return local;
  return localTime > serverTime ? local : server;
}

export function newDraftToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export function isDraftToken(value: string | undefined | null): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}
