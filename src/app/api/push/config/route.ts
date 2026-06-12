import { NextResponse } from "next/server";

export async function GET() {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY?.trim() ??
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ??
    null;

  const configured = Boolean(
    publicKey && process.env.VAPID_PRIVATE_KEY?.trim()
  );

  return NextResponse.json({ publicKey, configured });
}
