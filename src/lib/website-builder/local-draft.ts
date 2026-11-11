import { normalizeDocument } from "@/lib/website-builder/document-ops";
import type { WebsiteDocument } from "@/lib/website-builder/types";

const KEY = "hostvia.website.v1";

export interface LocalWebsiteDraft {
  document: WebsiteDocument;
  updatedAt: string;
}

export function readLocalWebsite(): LocalWebsiteDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { document?: unknown; updatedAt?: string };
    if (!parsed.document) return null;
    return {
      document: normalizeDocument(parsed.document),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeLocalWebsite(document: WebsiteDocument): string {
  const updatedAt = new Date().toISOString();
  window.localStorage.setItem(KEY, JSON.stringify({ document, updatedAt }));
  return updatedAt;
}
