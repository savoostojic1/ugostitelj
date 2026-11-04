import "server-only";

import { getSiteBaseUrl } from "@/lib/public/site-url";
import { reservationLinkSecret } from "@/lib/reservations/guest-link-secret";
import {
  generateManageToken,
  generateReferenceCode,
  hashManageToken,
  isReferenceCode,
  manageTokenExpiresAt,
  openManageToken,
  sealManageToken,
} from "@/lib/reservations/guest-access";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

export type GuestAccessLink = {
  token: string;
  reference: string;
  manageUrl: string;
};

function manageUrl(token: string): string {
  return `${getSiteBaseUrl()}/reservation/manage/${token}`;
}

export async function attachGuestAccess(
  bookingRequestId: string
): Promise<GuestAccessLink | null> {
  if (!hasServiceRoleKey()) return null;

  const secret = reservationLinkSecret();
  if (!secret) return null;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("booking_requests")
      .select(
        "id, check_out, reference_code, manage_token_hash, manage_token_ciphertext"
      )
      .eq("id", bookingRequestId)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("[guest-access] load failed");
      return null;
    }

    const row = data as {
      check_out: string;
      reference_code: string | null;
      manage_token_hash: string | null;
      manage_token_ciphertext: string | null;
    };

    if (row.manage_token_hash && row.manage_token_ciphertext) {
      const existing = openManageToken(row.manage_token_ciphertext, secret);
      if (existing && row.reference_code && isReferenceCode(row.reference_code)) {
        return {
          token: existing,
          reference: row.reference_code,
          manageUrl: manageUrl(existing),
        };
      }
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const token = generateManageToken();
      const reference = generateReferenceCode();
      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({
          reference_code: reference,
          manage_token_hash: hashManageToken(token),
          manage_token_ciphertext: sealManageToken(token, secret),
          manage_token_expires_at: manageTokenExpiresAt(row.check_out).toISOString(),
        })
        .eq("id", bookingRequestId);

      if (!updateError) {
        return { token, reference, manageUrl: manageUrl(token) };
      }

      const message = updateError.message ?? "";
      if (
        message.includes("manage_token") ||
        message.includes("reference_code") ||
        message.includes("schema cache") ||
        message.includes("column")
      ) {
        console.error("[guest-access] token columns are not available");
        return null;
      }

      if (!message.includes("duplicate") && updateError.code !== "23505") {
        console.error("[guest-access] update failed");
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("[guest-access] attach failed");
    void error;
    return null;
  }
}
