import { NextResponse } from "next/server";
import { readCreemConfig } from "@/lib/creem/config";
import { processCreemWebhookPayload } from "@/lib/creem/process-webhook";
import { verifyCreemWebhookSignature } from "@/lib/creem/signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();

  let config;
  try {
    config = readCreemConfig();
  } catch (err) {
    console.error("[creem webhook] configuration", err);
    return NextResponse.json({ error: "Creem is not configured." }, { status: 500 });
  }

  if (!config.webhookSecret) {
    console.error("[creem webhook] missing webhook secret");
    return NextResponse.json({ error: "Creem is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("creem-signature");
  if (!verifyCreemWebhookSignature(rawBody, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const result = await processCreemWebhookPayload(payload, config);
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error(
      "[creem webhook] handler failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
