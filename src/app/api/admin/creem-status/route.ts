import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { hasCreemCheckoutConfig, readCreemConfig } from "@/lib/creem/config";
import { getSiteBaseUrl } from "@/lib/public/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  try {
    const config = readCreemConfig();
    const mode = config.apiBaseUrl === "https://test-api.creem.io" ? "test" : "live";
    return NextResponse.json({
      checkoutReady: hasCreemCheckoutConfig(config),
      apiKeyConfigured: Boolean(config.apiKey),
      webhookSecretConfigured: Boolean(config.webhookSecret),
      productId: config.productId || null,
      mode,
      webhookUrl: `${getSiteBaseUrl()}/api/billing/creem/webhook`,
    });
  } catch (err) {
    console.error(
      "[creem admin] configuration",
      err instanceof Error ? err.message : "invalid"
    );
    return NextResponse.json({
      checkoutReady: false,
      apiKeyConfigured: false,
      webhookSecretConfigured: false,
      productId: null,
      mode: "unknown",
      webhookUrl: `${getSiteBaseUrl()}/api/billing/creem/webhook`,
    });
  }
}
