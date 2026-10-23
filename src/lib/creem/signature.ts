import { createHmac, timingSafeEqual } from "node:crypto";

export function creemSignatureHex(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifyCreemWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string
): boolean {
  const provided = signatureHeader?.trim() ?? "";
  if (!provided || !secret) return false;
  if (!/^[0-9a-f]+$/i.test(provided)) return false;

  const computed = creemSignatureHex(rawBody, secret);
  if (provided.length !== computed.length) return false;

  return timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(provided, "hex")
  );
}
