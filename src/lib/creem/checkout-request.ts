export const CREEM_METADATA_APP_ID = "hostvia";

export type CreemCheckoutRequestInput = {
  productId: string;
  requestId: string;
  successUrl: string;
  hostId: string;
  email: string;
  creemCustomerId?: string | null;
};

export type CreemCheckoutRequestBody = {
  product_id: string;
  request_id: string;
  success_url: string;
  customer: { id: string } | { email: string };
  metadata: {
    userId: string;
    appId: string;
  };
};

export function buildCreemCheckoutBody(
  input: CreemCheckoutRequestInput
): CreemCheckoutRequestBody {
  const productId = input.productId.trim();
  const hostId = input.hostId.trim();
  const email = input.email.trim();
  const requestId = input.requestId.trim();
  const successUrl = input.successUrl.trim();
  const existingCustomerId = input.creemCustomerId?.trim() || null;

  if (!productId || !hostId || !email || !requestId || !successUrl) {
    throw new Error("Creem checkout is missing required server fields.");
  }

  return {
    product_id: productId,
    request_id: requestId,
    success_url: successUrl,
    customer: existingCustomerId
      ? { id: existingCustomerId }
      : { email },
    metadata: {
      userId: hostId,
      appId: CREEM_METADATA_APP_ID,
    },
  };
}

export function readCreemCheckoutUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const checkoutUrl = (payload as { checkout_url?: unknown }).checkout_url;
  if (typeof checkoutUrl !== "string" || !checkoutUrl.trim()) return null;
  return checkoutUrl.trim();
}
