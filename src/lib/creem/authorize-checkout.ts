export type CheckoutAuthInput = {
  userId: string | null;
  email: string | null;
  isOwner: boolean;
  productIdConfigured: boolean;
  apiKeyConfigured: boolean;
};

export type CheckoutAuthDecision =
  | { ok: true }
  | { ok: false; status: 401 | 403 | 503; error: string };

export function authorizeCreemCheckout(
  input: CheckoutAuthInput
): CheckoutAuthDecision {
  if (!input.apiKeyConfigured || !input.productIdConfigured) {
    return {
      ok: false,
      status: 503,
      error: "Creem is not configured.",
    };
  }

  if (!input.userId || !input.email) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (!input.isOwner) {
    return {
      ok: false,
      status: 403,
      error: "Only the account owner can manage billing",
    };
  }

  return { ok: true };
}
