import "server-only";

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";

export async function requireAdminSession(): Promise<NextResponse | null> {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
