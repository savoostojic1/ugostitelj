import { NextResponse } from "next/server";
import {
  IMPERSONATING_COOKIE,
  impersonationCookieOptions,
} from "@/lib/admin/impersonation";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createServiceClient } from "@/lib/supabase/service";

type Body = {
  hostId?: string;
};

export async function POST(request: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const body = (await request.json()) as Body;
  const hostId = body.hostId?.trim();
  if (!hostId) {
    return NextResponse.json({ error: "Provide hostId" }, { status: 400 });
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Service client unavailable",
      },
      { status: 500 }
    );
  }

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(hostId);

  if (authError || !authData.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const email = authData.user.email?.trim();
  if (!email) {
    return NextResponse.json(
      { error: "User has no email — cannot create a session" },
      { status: 400 }
    );
  }

  const { data: profile } = await admin
    .from("host_profiles")
    .select("username")
    .eq("id", hostId)
    .maybeSingle();

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    return NextResponse.json(
      { error: linkError?.message ?? "Could not generate login link" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    redirectTo: "/dashboard",
    email,
    username: profile?.username ?? null,
  });

  const supabase = await createRouteHandlerClient(response);
  const { error: otpError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  if (otpError) {
    return NextResponse.json(
      { error: otpError.message ?? "Could not create user session" },
      { status: 500 }
    );
  }

  response.cookies.set(
    IMPERSONATING_COOKIE,
    JSON.stringify({
      hostId,
      email,
      username: profile?.username ?? null,
    }),
    impersonationCookieOptions()
  );

  return response;
}
