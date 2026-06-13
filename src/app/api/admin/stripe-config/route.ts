import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { getSiteBaseUrl } from "@/lib/public/site-url";
import {
  DEFAULT_STRIPE_APPLICATION_ID,
  loadStripeAppIdentity,
  validateApplicationId,
} from "@/lib/stripe/app-identity";
import {
  loadStripeConfigFromDb,
  maskStripeSecret,
  saveStripeConfigToDb,
  validateStripePriceId,
  validateStripeSecretKey,
  validateStripeWebhookSecret,
} from "@/lib/stripe/config-store";
import { resolveTestHostIdsInput } from "@/lib/stripe/test-host-ids";
import {
  hasStripeConfig,
  invalidateStripeConfigCache,
  resolveStripeConfig,
} from "@/lib/stripe/stripe";

type PutBody = {
  secretKey?: string;
  webhookSecret?: string;
  priceId?: string;
  applicationId?: string;
  testHostIds?: string;
};

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const [config, configured, identity] = await Promise.all([
    loadStripeConfigFromDb(),
    hasStripeConfig(),
    loadStripeAppIdentity(),
  ]);

  const resolved = await resolveStripeConfig();
  const envConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() ||
      process.env.STRIPE_PRICE_ID?.trim() ||
      process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
      process.env.STRIPE_CONFIG?.trim()
  );

  return NextResponse.json({
    configured,
    source: resolved?.source ?? null,
    envConfigured,
    supabaseConfigured: Boolean(
      config?.secret_key || config?.webhook_secret || config?.price_id
    ),
    secretKey: maskStripeSecret(config?.secret_key, 10),
    webhookSecret: maskStripeSecret(config?.webhook_secret, 6),
    priceId: config?.price_id ?? null,
    applicationId: identity.applicationId,
    testHostIds: identity.testHostIds,
    stripeMode: identity.stripeMode,
    updatedAt: config?.updated_at ?? null,
    webhookUrl: `${getSiteBaseUrl()}/api/billing/webhook`,
  });
}

export async function PUT(request: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const body = (await request.json()) as PutBody;

  const existing = await loadStripeConfigFromDb();
  const nextSecretKey =
    body.secretKey !== undefined
      ? body.secretKey.trim()
      : (existing?.secret_key ?? "");
  const nextWebhookSecret =
    body.webhookSecret !== undefined
      ? body.webhookSecret.trim()
      : (existing?.webhook_secret ?? "");
  const nextPriceId =
    body.priceId !== undefined
      ? body.priceId.trim()
      : (existing?.price_id ?? "");
  const nextApplicationId =
    body.applicationId !== undefined
      ? body.applicationId.trim()
      : (existing?.application_id ?? DEFAULT_STRIPE_APPLICATION_ID);

  if (body.secretKey?.trim()) {
    const error = validateStripeSecretKey(body.secretKey);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  if (body.webhookSecret?.trim()) {
    const error = validateStripeWebhookSecret(body.webhookSecret);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  if (body.priceId?.trim()) {
    const error = validateStripePriceId(body.priceId);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  if (body.applicationId !== undefined) {
    const error = validateApplicationId(body.applicationId);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  let resolvedTestHostIds: string[] | undefined;
  if (body.testHostIds !== undefined) {
    const { ids, errors } = await resolveTestHostIdsInput(body.testHostIds);
    if (errors.length) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }
    resolvedTestHostIds = ids;
  }

  if (
    !nextSecretKey &&
    !nextWebhookSecret &&
    !nextPriceId &&
    body.applicationId === undefined &&
    body.testHostIds === undefined
  ) {
    return NextResponse.json(
      { error: "Provide at least one Stripe value to save." },
      { status: 400 }
    );
  }

  try {
    const saved = await saveStripeConfigToDb({
      secretKey: body.secretKey !== undefined ? body.secretKey : undefined,
      webhookSecret:
        body.webhookSecret !== undefined ? body.webhookSecret : undefined,
      priceId: body.priceId !== undefined ? body.priceId : undefined,
      applicationId:
        body.applicationId !== undefined ? nextApplicationId : undefined,
      testHostIds:
        body.testHostIds !== undefined ? resolvedTestHostIds : undefined,
    });

    invalidateStripeConfigCache();
    const identity = await loadStripeAppIdentity();

    return NextResponse.json({
      message: "Stripe configuration saved.",
      configured: Boolean(saved.secret_key && saved.price_id),
      secretKey: maskStripeSecret(saved.secret_key, 10),
      webhookSecret: maskStripeSecret(saved.webhook_secret, 6),
      priceId: saved.price_id,
      applicationId: identity.applicationId,
      testHostIds: identity.testHostIds,
      stripeMode: identity.stripeMode,
      updatedAt: saved.updated_at,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not save Stripe config",
      },
      { status: 500 }
    );
  }
}
