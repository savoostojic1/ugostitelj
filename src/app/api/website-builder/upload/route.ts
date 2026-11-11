import { NextRequest, NextResponse } from "next/server";
import { normalizeDocument } from "@/lib/website-builder/document-ops";
import { newDraftToken } from "@/lib/website-builder/draft-store";
import { WEBSITE_LIMITS } from "@/lib/website-builder/limits";
import { countDocumentImages } from "@/lib/website-builder/sanitize";
import {
  readDraftToken,
  writeDraftToken,
} from "@/lib/website-builder/server/cookies";
import {
  loadOwnedWebsite,
  websiteAdmin,
  websiteServiceAvailable,
} from "@/lib/website-builder/server/repository";
import { validateHostCoverFile, HOST_ASSETS_BUCKET } from "@/lib/storage/host-assets";
import { clientIpFromHeaders } from "@/lib/security/rate-limit";
import { consumePublicRateLimit } from "@/lib/security/consume-rate-limit";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

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

export async function POST(request: NextRequest) {
  if (!websiteServiceAvailable()) {
    return NextResponse.json({ error: "Upload unavailable" }, { status: 503 });
  }

  const ip = clientIpFromHeaders(request.headers);
  const limit = await consumePublicRateLimit(
    "website_upload",
    ip,
    WEBSITE_LIMITS.uploadsPerHour,
    60 * 60
  );
  if (limit === "deny") {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
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

  const authResponse = new NextResponse();
  const supabaseAuth = await createRouteHandlerClient(authResponse);
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const admin = websiteAdmin();
  let folder = "";
  let createdToken: string | undefined;

  if (user) {
    const website = await loadOwnedWebsite(user.id);
    if (website) {
      const document = normalizeDocument(website.draft_document);
      if (countDocumentImages(document) >= WEBSITE_LIMITS.galleryImages + WEBSITE_LIMITS.photosPerAccommodation) {
        return NextResponse.json({ error: "Image limit reached" }, { status: 413 });
      }
      folder = `${user.id}/websites/${website.id}`;
    }
  }

  if (!folder) {
    let token = readDraftToken(request);
    if (token) {
      const { data: project } = await admin
        .from("website_projects")
        .select("id, document, claimed_at")
        .eq("draft_token", token)
        .maybeSingle();
      if (!project || project.claimed_at) token = undefined;
      else if (countDocumentImages(normalizeDocument(project.document)) > 80) {
        return NextResponse.json({ error: "Image limit reached" }, { status: 413 });
      }
    }
    if (!token) {
      const createLimit = await consumePublicRateLimit(
        "website_draft_create",
        ip,
        WEBSITE_LIMITS.draftCreatesPerHour,
        60 * 60
      );
      if (createLimit === "deny") {
        return NextResponse.json({ error: "Too many new websites from this network." }, { status: 429 });
      }
      token = newDraftToken();
      const { error } = await admin.from("website_projects").insert({
        draft_token: token,
        document: {},
      });
      if (error) {
        console.error("[website-builder/upload create]", error.message);
        return NextResponse.json({ error: "Could not start a draft" }, { status: 500 });
      }
      createdToken = token;
    }
    folder = `website-drafts/${token}`;
  }

  const path = `${folder}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;
  const { error: uploadError } = await admin.storage.from(HOST_ASSETS_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: "3600",
  });
  if (uploadError) {
    console.error("[website-builder/upload]", uploadError.message);
    return NextResponse.json({ error: "Could not upload image" }, { status: 500 });
  }
  const { data: publicData } = admin.storage.from(HOST_ASSETS_BUCKET).getPublicUrl(path);
  const response = NextResponse.json({ url: `${publicData.publicUrl}?v=${Date.now()}` });
  if (createdToken) writeDraftToken(response, createdToken);
  return response;
}
