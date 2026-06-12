export const PASSWORD_RECOVERY_COOKIE = "hostvia_password_recovery";

export function getPasswordRecoveryRedirectUrl(origin: string): string {
  return `${origin}/auth/callback/recovery`;
}

export function setPasswordRecoveryPendingCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=1; path=/; max-age=900; SameSite=Lax`;
}

export function clearPasswordRecoveryPendingCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${PASSWORD_RECOVERY_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
