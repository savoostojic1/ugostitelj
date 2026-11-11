import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  parseQuickStartResult,
  QUICK_START_LIMITS,
  QUICK_START_MODEL,
  QUICK_START_SCHEMA,
  quickStartSystemPrompt,
  quickStartUserText,
  tidyListingText,
} from "@/lib/website-builder/ai/quick-start";
import { readDraftToken } from "@/lib/website-builder/server/cookies";
import { WEBSITE_LANGUAGES, WEBSITE_THEMES, type WebsiteLanguage, type WebsiteThemeId } from "@/lib/website-builder/types";
import { consumePublicRateLimit } from "@/lib/security/consume-rate-limit";
import { clientIpFromHeaders } from "@/lib/security/rate-limit";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";
export const maxDuration = 180;

const DAY = 24 * 60 * 60;
const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/;

type PhotoMedia = "image/jpeg" | "image/png" | "image/webp";

/** `code` tells the host (and support) which part failed, without exposing details. */
function fail(error: string, status: number, code?: string, detail?: string) {
  return NextResponse.json({ error, code, detail }, { status });
}

/** Parses the reply, tolerating code fences or a stray sentence around the object. */
function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) throw new SyntaxError("No JSON object in the reply");
    return JSON.parse(text.slice(start, end + 1));
  }
}

/**
 * Writes a whole website from the text of the host's own listing and thumbnails of
 * their photographs. Nothing is fetched from listing platforms: the host pastes the
 * text themselves. Costs money per call, so it is rate limited per draft, account and
 * IP, and refuses to run in production when the rate limiter is unavailable.
 */
export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail("AI writing is not set up on this server yet.", 503, "no_key");
  }

  const body = (await request.json().catch(() => null)) as {
    listingText?: unknown;
    theme?: unknown;
    language?: unknown;
    photos?: unknown;
  } | null;
  if (!body) return fail("Invalid request", 400);

  const theme = WEBSITE_THEMES.includes(body.theme as WebsiteThemeId) ? (body.theme as WebsiteThemeId) : null;
  if (!theme) return fail("Choose a design first", 400);
  const language =
    body.language === "auto" || WEBSITE_LANGUAGES.includes(body.language as WebsiteLanguage)
      ? (body.language as WebsiteLanguage | "auto")
      : "auto";
  const listingText = typeof body.listingText === "string" ? tidyListingText(body.listingText) : "";
  if (listingText.length < QUICK_START_LIMITS.minChars) {
    return fail("Paste a little more of your listing so there is enough to write from.", 400);
  }
  if (listingText.length > QUICK_START_LIMITS.maxChars) {
    return fail("That text is too long. Copy only the listing page, not several pages.", 413);
  }
  const rawPhotos = Array.isArray(body.photos) ? body.photos : [];
  if (rawPhotos.length > QUICK_START_LIMITS.photos) return fail(`Use up to ${QUICK_START_LIMITS.photos} photographs`, 413);
  const photos: { media: PhotoMedia; data: string }[] = [];
  for (const entry of rawPhotos) {
    const match = typeof entry === "string" && entry.length <= QUICK_START_LIMITS.photoBytes * 1.4 ? PHOTO_PATTERN.exec(entry) : null;
    if (!match) return fail("One of the photographs could not be read", 400);
    photos.push({ media: `image/${match[1]}` as PhotoMedia, data: match[2] });
  }

  // Rate limits: per IP, and per draft or account.
  const authResponse = new NextResponse();
  const supabase = await createRouteHandlerClient(authResponse);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ip = clientIpFromHeaders(request.headers);
  const owner = user ? `user:${user.id}` : readDraftToken(request) ? `draft:${readDraftToken(request)}` : null;
  const checks = await Promise.all([
    consumePublicRateLimit("website_ai_ip", ip, QUICK_START_LIMITS.perIpPerDay, DAY),
    owner ? consumePublicRateLimit("website_ai_owner", owner, QUICK_START_LIMITS.perDraftPerDay, DAY) : Promise.resolve("allow" as const),
  ]);
  if (checks.includes("deny")) {
    return fail("You have used today's AI writing for this website. You can still edit everything by hand, or try again tomorrow.", 429);
  }
  if (checks.includes("unavailable") && process.env.NODE_ENV === "production") {
    console.error("[website-ai] rate limiter unavailable; check SUPABASE_SERVICE_ROLE_KEY and consume_public_rate_limit");
    return fail("AI writing is unavailable right now. Please try again later.", 503, "limits_unavailable");
  }

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  photos.forEach((photo, index) => {
    content.push({ type: "text", text: `Photo ${index}:` });
    content.push({ type: "image", source: { type: "base64", media_type: photo.media, data: photo.data } });
  });
  content.push({ type: "text", text: quickStartUserText({ theme, language, listingText, photoCount: photos.length }) });

  const client = new Anthropic();
  const base = {
    model: QUICK_START_MODEL,
    max_tokens: 32000,
    system: quickStartSystemPrompt(),
    messages: [{ role: "user" as const, content }],
  };
  const withSchema = {
    ...base,
    output_config: {
      effort: "medium" as const,
      format: { type: "json_schema" as const, schema: QUICK_START_SCHEMA as unknown as Record<string, unknown> },
    },
  };
  // Without enforced output the same contract goes into the prompt and the JSON is
  // validated in code (parseQuickStartResult) exactly as before.
  const withPromptedJson = {
    ...base,
    output_config: { effort: "medium" as const },
    system: `${quickStartSystemPrompt()}\n\nReply with only one JSON object, no prose and no code fences, that matches this JSON schema:\n${JSON.stringify(QUICK_START_SCHEMA)}`,
  };

  /**
   * Tries the richest request first and steps down when the API rejects a feature:
   * 1. enforced schema with server-side fallback, 2. enforced schema alone,
   * 3. JSON requested in the prompt. Credit, key and rate errors are not retried.
   */
  const generate = async () => {
    const attempts: { label: string; run: () => Promise<Anthropic.Beta.BetaMessage> }[] = [
      { label: "schema+fallback", run: () => client.beta.messages.stream({ ...withSchema, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }).finalMessage() },
      { label: "schema", run: () => client.beta.messages.stream(withSchema).finalMessage() },
      { label: "prompted-json", run: () => client.beta.messages.stream(withPromptedJson).finalMessage() },
    ];
    let lastError: unknown = null;
    for (const attempt of attempts) {
      try {
        return { message: await attempt.run(), via: attempt.label };
      } catch (error) {
        const retryable = error instanceof Anthropic.BadRequestError && !/credit|billing|balance/i.test(error.message);
        if (!retryable) throw error;
        console.warn(`[website-ai] ${attempt.label} rejected:`, error.message);
        lastError = error;
      }
    }
    throw lastError;
  };

  try {
    const { message, via } = await generate();

    if (message.stop_reason === "refusal") {
      return fail("The listing could not be turned into a website. Please check the text and try again.", 422, "refusal");
    }
    if (message.stop_reason === "max_tokens") {
      return fail("The listing was too long to finish. Try copying a shorter part of the page.", 502, "too_long");
    }
    const textBlock = message.content.find((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text");
    if (!textBlock) return fail("No content came back. Please try again.", 502, "empty");
    const result = parseQuickStartResult(extractJson(textBlock.text), photos.length);
    console.info("[website-ai] generated", {
      model: message.model,
      via,
      input: message.usage.input_tokens,
      output: message.usage.output_tokens,
      photos: photos.length,
      chars: listingText.length,
    });
    const response = NextResponse.json({ result });
    for (const cookie of authResponse.cookies.getAll()) response.cookies.set(cookie);
    return response;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error("[website-ai] api error", error.status, error.message);
    } else {
      console.error("[website-ai] failed", error instanceof Error ? error.message : error);
    }
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      return fail("AI writing is not set up correctly: the AI key was rejected.", 502, "key_rejected");
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail("AI writing is busy right now. Please try again in a minute.", 503, "busy");
    }
    if (error instanceof Anthropic.BadRequestError && /credit|billing|balance/i.test(error.message)) {
      return fail("AI writing is paused: the AI account has no credit left.", 502, "no_credit");
    }
    if (error instanceof Anthropic.NotFoundError) {
      return fail("AI writing is not available for this account yet.", 502, "model_unavailable");
    }
    if (error instanceof Anthropic.BadRequestError) {
      return fail("The AI service did not accept this request.", 502, "rejected", error.message.slice(0, 300));
    }
    if (error instanceof Anthropic.APIError) {
      return fail("AI writing is unavailable right now. Please try again later.", 502, `api_${error.status ?? "error"}`);
    }
    if (error instanceof SyntaxError) {
      return fail("The AI reply could not be read. Please try again.", 502, "bad_json");
    }
    return fail("Something went wrong while writing your website. Please try again.", 500, "server");
  }
}
