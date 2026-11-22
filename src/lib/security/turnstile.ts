import "server-only";

/**
 * Server-side check of a Cloudflare Turnstile token.
 * Returns "disabled" when TURNSTILE_SECRET_KEY is not set (local dev), so forms
 * keep working until the keys are configured.
 */
export type TurnstileResult = "ok" | "fail" | "disabled";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstileToken(
  token: unknown,
  ip?: string
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return "disabled";
  if (typeof token !== "string" || !token || token.length > 2048) return "fail";

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip && ip !== "unknown") form.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true ? "ok" : "fail";
  } catch (error) {
    // Cloudflare unreachable: fail closed, the person can retry.
    console.error("[turnstile] verify failed", error instanceof Error ? error.message : error);
    return "fail";
  }
}
