export function getSupabaseErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const e = err as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [e.message, e.details, e.hint, e.code ? `(${e.code})` : null].filter(
      Boolean
    );
    if (parts.length) return parts.join(" — ");
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
