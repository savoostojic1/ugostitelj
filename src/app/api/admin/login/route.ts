import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminPanelConfigured,
  verifyAdminCredentials,
} from "@/lib/admin/credentials";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
} from "@/lib/admin/session";
import {
  failedAttemptDelay,
  guardAdminAttempt,
} from "@/lib/security/admin-login-guard";

type Body = {
  username?: string;
  password?: string;
  captchaToken?: string;
};

export async function POST(request: Request) {
  if (!(await adminPanelConfigured())) {
    return NextResponse.json(
      {
        error:
          "Admin panel is not configured. Open /admin to set a password first.",
      },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  const guard = await guardAdminAttempt(request, body.captchaToken);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  if (!username || !password) {
    await failedAttemptDelay();
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!(await verifyAdminCredentials(username, password))) {
    console.warn("[admin-login] failed attempt");
    await failedAttemptDelay();
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, adminCookieOptions());

  return NextResponse.json({ ok: true });
}
