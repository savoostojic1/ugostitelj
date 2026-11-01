import { readLocalDraft } from "@/lib/guest-guide/local-draft";
import type { GuestGuideDocument } from "@/lib/guest-guide/types";

export interface PublishedGuideRef {
  id: string;
  slug: string;
}

async function publishDocument(
  document: GuestGuideDocument
): Promise<PublishedGuideRef> {
  const res = await fetch("/api/guest-guides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      theme: document.theme,
      content: document.content,
      sectionOrder: document.sectionOrder,
      sectionVisibility: document.sectionVisibility,
      publish: true,
    }),
  });
  const json = (await res.json()) as {
    guide?: { id: string; slug: string };
    error?: string;
  };
  if (!res.ok || !json.guide) {
    throw new Error(json.error ?? "Could not publish guide");
  }
  return { id: json.guide.id, slug: json.guide.slug };
}

/** Best-effort server draft sync so the claim cookie exists when service role is configured. */
export async function ensureServerDraft(
  document?: GuestGuideDocument
): Promise<void> {
  const doc = document ?? readLocalDraft()?.document;
  if (!doc) return;
  try {
    await fetch("/api/guest-guides/drafts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: doc.theme,
        content: doc.content,
        sectionOrder: doc.sectionOrder,
        sectionVisibility: doc.sectionVisibility,
      }),
    });
  } catch {
    // Local draft remains the fallback for publish after auth.
  }
}

/**
 * After auth: claim the httpOnly draft cookie when present, otherwise publish
 * the localStorage draft via the authenticated guides API.
 */
export async function publishGuestGuideDraft(
  document?: GuestGuideDocument
): Promise<PublishedGuideRef> {
  await ensureServerDraft(document);

  const claimRes = await fetch("/api/guest-guides/drafts/claim", {
    method: "POST",
  });
  const claimJson = (await claimRes.json()) as {
    guide?: { id: string; slug: string };
    error?: string;
  };

  if (claimRes.ok && claimJson.guide) {
    return { id: claimJson.guide.id, slug: claimJson.guide.slug };
  }

  const localDocument = document ?? readLocalDraft()?.document;
  if (localDocument) {
    return publishDocument(localDocument);
  }

  throw new Error(
    claimJson.error === "No draft to claim"
      ? "Your draft was not found. Go back to the builder, make a small edit, then try again."
      : (claimJson.error ?? "Could not publish guide")
  );
}
