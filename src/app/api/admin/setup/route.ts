import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminSetupRequired,
  DEFAULT_ADMIN_USERNAME,
  setupAdminCredentials,
} from "@/lib/admin/credentials";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
} from "@/lib/admin/session";
import { guardAdminAttempt } from "@/lib/security/admin-login-guard";

type Body = {
  username?: string;
  password?: string;
  captchaToken?: string;
};

export async function GET() {
  const setupRequired = await adminSetupRequired();

  // Never reveal the configured admin username: it is half of the credentials.
  return NextResponse.json({
    setupRequired,
    username: setupRequired ? DEFAULT_ADMIN_USERNAME : null,
  });
}

export async function POST(request: Request) {
  if (!(await adminSetupRequired())) {
    return NextResponse.json(
      { error: "Admin password is already configured" },
      { status: 409 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const guard = await guardAdminAttempt(request, body.captchaToken);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const username = body.username?.trim() || DEFAULT_ADMIN_USERNAME;
  const password = body.password ?? "";

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    await setupAdminCredentials({ username, password });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not save admin password",
      },
      { status: 500 }
    );
  }

  // Sign in right away: the captcha token above is single use.
  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, adminCookieOptions());

  return NextResponse.json({ ok: true, username });
}
