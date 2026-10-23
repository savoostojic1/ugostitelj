import { NextResponse } from "next/server";
import { authorizeCreemCheckout } from "@/lib/creem/authorize-checkout";
import {
  buildCreemCheckoutBody,
  readCreemCheckoutUrl,
} from "@/lib/creem/checkout-request";
import {
  hasCreemCheckoutConfig,
  readCreemConfig,
  resolveCreemApiBaseUrl,
} from "@/lib/creem/config";
import { getSiteBaseUrl } from "@/lib/public/site-url";
import { createClient } from "@/lib/supabase/server";
import { resolveBillingHostId } from "@/lib/subscriptions/resolve-host-subscription";

export const dynamic = "force-dynamic";

function checkoutSuccessUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/dashboard/billing?checkout=return`;
}

export async function POST() {
  let config;
  try {
    config = readCreemConfig();
    resolveCreemApiBaseUrl(config.apiBaseUrl);
  } catch (err) {
    console.error("[creem checkout] configuration", err);
    return NextResponse.json(
      { error: "Creem is not configured." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { hostId, isOwner } = user
    ? await resolveBillingHostId(supabase, user.id)
    : { hostId: "", isOwner: false };

  const decision = authorizeCreemCheckout({
    userId: user?.id ?? null,
    email: user?.email ?? null,
    isOwner: Boolean(user) && isOwner,
    productIdConfigured: hasCreemCheckoutConfig(config) && Boolean(config.productId),
    apiKeyConfigured: hasCreemCheckoutConfig(config) && Boolean(config.apiKey),
  });

  if (!decision.ok || !user?.email) {
    return NextResponse.json(
      { error: decision.ok ? "Unauthorized" : decision.error },
      { status: decision.ok ? 401 : decision.status }
    );
  }

  const { data: profile } = await supabase
    .from("host_profiles")
    .select("creem_customer_id")
    .eq("id", hostId)
    .maybeSingle();

  const requestId = `hostvia_${crypto.randomUUID()}`;
  const body = buildCreemCheckoutBody({
    productId: config.productId,
    requestId,
    successUrl: checkoutSuccessUrl(getSiteBaseUrl()),
    hostId,
    email: user.email,
    creemCustomerId: profile?.creem_customer_id,
  });

  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}/v1/checkouts`, {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[creem checkout] request failed", err);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 502 }
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  const checkoutUrl = readCreemCheckoutUrl(payload);

  if (!response.ok || !checkoutUrl) {
    console.error("[creem checkout] Creem returned", response.status);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: checkoutUrl });
}
