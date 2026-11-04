import "server-only";

/**
 * Key used only on the server to encrypt guest management tokens.
 * A dedicated RESERVATION_LINK_KEY survives service-role rotation.
 * The service role key is the fallback because this process already holds it.
 */
export function reservationLinkSecret(): string | null {
  const dedicated = process.env.RESERVATION_LINK_KEY?.trim();
  if (dedicated) return dedicated;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return serviceRole || null;
}
