export type ParsedJsonResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number; nonJson: boolean };

const GUEST_FRIENDLY_ERROR =
  "We could not send your request right now. Please try again in a moment.";

function previewBody(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 180);
}

function looksLikeHtml(text: string, contentType: string | null): boolean {
  const type = (contentType ?? "").toLowerCase();
  if (type.includes("text/html")) return true;
  const trimmed = text.trimStart();
  return (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<HTML")
  );
}

/**
 * Safely read a fetch Response as JSON. Never throws on HTML/invalid bodies.
 * Logs endpoint, status, and a short body preview for debugging.
 */
export async function parseJsonResponse<T extends Record<string, unknown>>(
  response: Response,
  options?: { endpoint?: string; guestMessage?: string }
): Promise<ParsedJsonResult<T>> {
  const endpoint = options?.endpoint ?? response.url ?? "(unknown)";
  const guestMessage = options?.guestMessage ?? GUEST_FRIENDLY_ERROR;
  const contentType = response.headers.get("content-type");
  const text = await response.text();

  if (looksLikeHtml(text, contentType) || !text.trim()) {
    console.error("[hostvia] Expected JSON from API but received non-JSON", {
      endpoint,
      status: response.status,
      contentType,
      preview: previewBody(text) || "(empty)",
    });
    return {
      ok: false,
      error: guestMessage,
      status: response.status,
      nonJson: true,
    };
  }

  try {
    const data = JSON.parse(text) as T;
    return { ok: true, data, status: response.status };
  } catch {
    console.error("[hostvia] API response was not valid JSON", {
      endpoint,
      status: response.status,
      contentType,
      preview: previewBody(text),
    });
    return {
      ok: false,
      error: guestMessage,
      status: response.status,
      nonJson: true,
    };
  }
}

export function guestBookingRequestErrorMessage(
  parsed: ParsedJsonResult<{ error?: unknown }>,
  responseOk: boolean
): string {
  if (!parsed.ok) return parsed.error;
  if (responseOk) return GUEST_FRIENDLY_ERROR;
  const apiError = parsed.data.error;
  if (typeof apiError === "string" && apiError.trim()) {
    return apiError;
  }
  return GUEST_FRIENDLY_ERROR;
}
