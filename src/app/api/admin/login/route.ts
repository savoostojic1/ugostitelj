import { NextResponse } from "next/server";
import {
  adminPanelConfigured,
  verifyAdminCredentials,
} from "@/lib/admin/credentials";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
} from "@/lib/admin/session";

type Body = {
  username?: string;
  password?: string;
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

  const body = (await request.json()) as Body;
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!(await verifyAdminCredentials(username, password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_COOKIE,
    await createAdminSessionToken(),
    adminCookieOptions()
  );
  return response;
}
