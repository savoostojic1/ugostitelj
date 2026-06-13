import { NextResponse } from "next/server";
import {
  adminSetupRequired,
  DEFAULT_ADMIN_USERNAME,
  getAdminUsername,
  setupAdminCredentials,
} from "@/lib/admin/credentials";

type Body = {
  username?: string;
  password?: string;
};

export async function GET() {
  const setupRequired = await adminSetupRequired();
  const username = setupRequired
    ? DEFAULT_ADMIN_USERNAME
    : await getAdminUsername();

  return NextResponse.json({
    setupRequired,
    username,
  });
}

export async function POST(request: Request) {
  if (!(await adminSetupRequired())) {
    return NextResponse.json(
      { error: "Admin password is already configured" },
      { status: 409 }
    );
  }

  const body = (await request.json()) as Body;
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

  return NextResponse.json({ ok: true, username });
}
