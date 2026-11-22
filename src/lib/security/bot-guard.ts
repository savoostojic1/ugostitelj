/**
 * Invisible bot checks for public forms that guests fill in (no captcha friction).
 *
 * - Honeypot: a hidden field real people never see or fill. Bots that auto-fill
 *   every input give themselves away.
 * - Fill time: the form sends the moment it was opened. A submission that arrives
 *   faster than a human could type is treated as automated.
 */

export const HONEYPOT_FIELD = "company_website";
export const FORM_STARTED_FIELD = "formStartedAt";

/** Faster than this from opening the details step to sending is not a person. */
export const MIN_FORM_FILL_MS = 2500;
/** A form open longer than this is still accepted, but the timestamp is ignored. */
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 24;

export type BotGuardVerdict = "ok" | "honeypot" | "too_fast";

export function evaluateBotGuard(
  body: Record<string, unknown>,
  now: number = Date.now()
): BotGuardVerdict {
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return "honeypot";
  }

  const startedRaw = body[FORM_STARTED_FIELD];
  const started = typeof startedRaw === "number" ? startedRaw : Number(startedRaw);
  if (Number.isFinite(started) && started > 0) {
    const elapsed = now - started;
    // A timestamp from the future or far past is not trusted either way.
    if (elapsed >= 0 && elapsed < MAX_FORM_AGE_MS && elapsed < MIN_FORM_FILL_MS) {
      return "too_fast";
    }
  }

  return "ok";
}

const URL_PATTERN = /(https?:\/\/|www\.)\S+/gi;

/** Messages stuffed with links are almost always spam. */
export function looksLikeLinkSpam(text: string | null | undefined): boolean {
  if (!text) return false;
  const links = text.match(URL_PATTERN);
  return (links?.length ?? 0) >= 3;
}
