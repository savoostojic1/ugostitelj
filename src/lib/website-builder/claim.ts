export type ClaimError =
  | "not_found"
  | "expired"
  | "claimed_by_other"
  | "account_has_website"
  | "invalid_token";

export interface ClaimInput {
  token: string;
  userId: string;
  project:
    | {
        claimedBy: string | null;
        websiteId: string | null;
        expiresAt: string;
      }
    | null;
  existingWebsiteId: string | null;
  now?: Date;
  replaceDraft?: boolean;
}

export type ClaimDecision =
  | { ok: true; action: "create" | "return" | "replace-draft"; websiteId: string | null }
  | { ok: false; error: ClaimError; websiteId?: string };

/** Mirrors `claim_website_project`. The database function is the enforcement boundary. */
export function decideClaim(input: ClaimInput): ClaimDecision {
  if (!input.token || input.token.length < 32 || input.token.length > 128) {
    return { ok: false, error: "invalid_token" };
  }
  if (!input.project) return { ok: false, error: "not_found" };

  if (input.project.claimedBy && input.project.claimedBy !== input.userId) {
    return { ok: false, error: "claimed_by_other" };
  }

  if (input.project.claimedBy === input.userId && input.project.websiteId) {
    return { ok: true, action: "return", websiteId: input.project.websiteId };
  }

  const now = input.now ?? new Date();
  if (new Date(input.project.expiresAt).getTime() < now.getTime()) {
    return { ok: false, error: "expired" };
  }

  if (input.existingWebsiteId) {
    if (input.replaceDraft) {
      return { ok: true, action: "replace-draft", websiteId: input.existingWebsiteId };
    }
    return {
      ok: false,
      error: "account_has_website",
      websiteId: input.existingWebsiteId,
    };
  }

  return { ok: true, action: "create", websiteId: null };
}

export function nextWebsitePublication(action: "publish" | "unpublish"): {
  status: "published" | "unpublished";
  publicSiteMode: "website";
} {
  if (action === "publish") {
    return { status: "published", publicSiteMode: "website" };
  }
  return { status: "unpublished", publicSiteMode: "website" };
}

export type PublicExperience = "website" | "booking" | "offline";

export function resolvePublicExperience(input: {
  mode: "booking" | "website" | null | undefined;
  hostPublished: boolean;
  websiteStatus: "draft" | "published" | "unpublished" | null;
}): PublicExperience {
  if (input.mode === "website") {
    return input.websiteStatus === "published" && input.hostPublished
      ? "website"
      : "offline";
  }
  return input.hostPublished ? "booking" : "offline";
}
