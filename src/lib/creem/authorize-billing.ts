export type CreemBillingAction = "portal" | "cancel" | "resume";

export type CreemBillingAuthInput = {
  userId: string | null;
  isOwner: boolean;
  apiKeyConfigured: boolean;
  complimentary: boolean;
  creemCustomerId: string | null;
  creemSubscriptionId: string | null;
  action: CreemBillingAction;
};

export type CreemBillingAuthDecision =
  | { ok: true }
  | { ok: false; status: 400 | 401 | 403 | 503; error: string };

export function authorizeCreemBillingAction(
  input: CreemBillingAuthInput
): CreemBillingAuthDecision {
  if (!input.apiKeyConfigured) {
    return { ok: false, status: 503, error: "Creem is not configured." };
  }

  if (!input.userId) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (!input.isOwner) {
    return {
      ok: false,
      status: 403,
      error: "Only the account owner can manage billing",
    };
  }

  if (input.complimentary) {
    return {
      ok: false,
      status: 400,
      error: "Complimentary Pro is not managed through billing.",
    };
  }

  if (input.action === "portal" && !input.creemCustomerId) {
    return { ok: false, status: 400, error: "No billing customer found." };
  }

  if (
    (input.action === "cancel" || input.action === "resume") &&
    !input.creemSubscriptionId
  ) {
    return { ok: false, status: 400, error: "No subscription found." };
  }

  return { ok: true };
}
