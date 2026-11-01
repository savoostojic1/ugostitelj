import { NextRequest, NextResponse } from "next/server";
import {
  getDraftToken,
  setDraftTokenCookie,
} from "@/lib/guest-guide/draft-cookie";
import {
  HOST_ASSETS_BUCKET,
  validateHostCoverFile,
} from "@/lib/storage/host-assets";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

function newDraftToken(): string {
  return (
    crypto.randomUUID().replace(/-/g, "") +
    crypto.randomUUID().replace(/-/g, "")
  );
}

export async function POST(request: NextRequest) {
  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      { error: "Upload unavailable without service role" },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const validationError = validateHostCoverFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const supabase = createServiceClient();
  let draftToken = getDraftToken(request);
  let createdToken: string | undefined;

  if (draftToken) {
    const { data: draft, error: draftError } = await supabase
      .from("guest_guide_drafts")
      .select("id, claimed_at")
      .eq("draft_token", draftToken)
      .maybeSingle();

    if (draftError) {
      console.error("[guest-guides/drafts/upload]", draftError.message);
      return NextResponse.json({ error: "Could not verify draft" }, { status: 500 });
    }

    if (!draft || draft.claimed_at) {
      draftToken = undefined;
    }
  }

  if (!draftToken) {
    draftToken = newDraftToken();
    const { error: insertError } = await supabase.from("guest_guide_drafts").insert({
      draft_token: draftToken,
    });
    if (insertError) {
      console.error("[guest-guides/drafts/upload create]", insertError.message);
      return NextResponse.json({ error: "Could not create draft" }, { status: 500 });
    }
    createdToken = draftToken;
  }

  const ext = extensionForMime(file.type);
  const path = `drafts/${draftToken}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(HOST_ASSETS_BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("[guest-guides/drafts/upload storage]", uploadError.message);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicData } = supabase.storage
    .from(HOST_ASSETS_BUCKET)
    .getPublicUrl(path);

  const response = NextResponse.json({
    url: `${publicData.publicUrl}?v=${Date.now()}`,
  });
  if (createdToken) {
    setDraftTokenCookie(response, createdToken);
  }
  return response;
}
