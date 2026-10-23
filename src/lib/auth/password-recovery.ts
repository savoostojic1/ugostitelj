export const PASSWORD_RECOVERY_COOKIE = "hostvia_password_recovery";

export function getPasswordRecoveryRedirectUrl(origin: string): string {
  return `${origin}/auth/callback/recovery`;
}

export type RecoverySessionTokens = {
  accessToken: string;
  refreshToken: string;
};

/** Tokens Supabase appends to the recovery redirect. They work in any browser. */
export function parseRecoveryTokens(
  params: URLSearchParams
): RecoverySessionTokens | null {
  const type = params.get("type");
  if (type && type !== "recovery") return null;
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function parseRecoveryHash(hash: string): RecoverySessionTokens | null {
  const value = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!value) return null;
  return parseRecoveryTokens(new URLSearchParams(value));
}

export function setPasswordRecoveryPendingCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=1; path=/; max-age=900; SameSite=Lax`;
}

export function clearPasswordRecoveryPendingCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
