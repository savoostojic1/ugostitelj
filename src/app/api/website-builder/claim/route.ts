import { NextRequest, NextResponse } from "next/server";
import { normalizeDocument } from "@/lib/website-builder/document-ops";
import { readDraftToken, clearDraftToken } from "@/lib/website-builder/server/cookies";
import { websiteAdmin, websiteServiceAvailable } from "@/lib/website-builder/server/repository";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { requireUser } from "@/lib/supabase/require-user";
import { resolveBillingHostId } from "@/lib/subscriptions/resolve-host-subscription";

export async function POST(request: NextRequest) {
  const authResponse = new NextResponse();
  const supabase = await createRouteHandlerClient(authResponse);
  let user;
  try {
    user = await requireUser(supabase);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isOwner } = await resolveBillingHostId(supabase, user.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Only the account owner can claim a website" }, { status: 403 });
  }

  const token = readDraftToken(request);
  if (!token) {
    return NextResponse.json({ error: "No website draft to claim" }, { status: 400 });
  }
  if (!websiteServiceAvailable()) {
    return NextResponse.json(
      { error: "Claim is unavailable until the server is configured. Your draft is still saved in this browser." },
      { status: 503 }
    );
  }

  let replaceDraft = false;
  try {
    const body = await request.json();
    replaceDraft = Boolean(body && typeof body === "object" && (body as { replaceDraft?: boolean }).replaceDraft);
  } catch {
    replaceDraft = false;
  }

  const admin = websiteAdmin();
  const { data: project, error: projectError } = await admin
    .from("website_projects")
    .select("id, document, claimed_at")
    .eq("draft_token", token)
    .maybeSingle();
  if (projectError) {
    console.error("[website-builder/claim]", projectError.message);
    return NextResponse.json({ error: "Could not load draft" }, { status: 500 });
  }
  if (project && !project.claimed_at) {
    const document = normalizeDocument(project.document);
    const { error: sanitizeError } = await admin
      .from("website_projects")
      .update({ document })
      .eq("id", project.id);
    if (sanitizeError) {
      console.error("[website-builder/claim sanitize]", sanitizeError.message);
      return NextResponse.json({ error: "Could not prepare draft" }, { status: 500 });
    }
  }

  const { data, error } = await supabase.rpc("claim_website_project", {
    p_token: token,
    p_replace_draft: replaceDraft,
  });
  if (error) {
    console.error("[website-builder/claim rpc]", error.message);
    return NextResponse.json({ error: "Could not claim website" }, { status: 500 });
  }

  const result = (data ?? {}) as {
    ok?: boolean;
    error?: string;
    websiteId?: string;
    created?: boolean;
    replacedDraft?: boolean;
    slug?: string;
  };

  if (!result.ok) {
    const status = result.error === "account_has_website" ? 409 : result.error === "expired" ? 410 : 400;
    const response = NextResponse.json(
      {
        ok: false,
        error: result.error ?? "claim_failed",
        websiteId: result.websiteId ?? null,
      },
      { status }
    );
    for (const cookie of authResponse.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    return response;
  }

  const response = NextResponse.json({
    ok: true,
    websiteId: result.websiteId,
    created: result.created === true,
    replacedDraft: result.replacedDraft === true,
    slug: result.slug ?? null,
  });
  for (const cookie of authResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  clearDraftToken(response);
  return response;
}
