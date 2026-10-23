import { NextResponse } from "next/server";
import {
  applyConfirmedBillingUpdate,
  creemApiRequest,
} from "@/lib/creem/creem-api";
import { requireCreemBillingOwner } from "@/lib/creem/require-owner";
import {
  confirmResumedSubscription,
  isSafeCreemObjectId,
} from "@/lib/creem/subscription-actions";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireCreemBillingOwner("resume");
  if (!access.ok) return access.response;

  const subscriptionId = access.context.creemSubscriptionId;
  if (!isSafeCreemObjectId(subscriptionId) || !access.context.config.productId) {
    return NextResponse.json(
      { error: access.context.config.productId ? "No subscription found." : "Creem is not configured." },
      { status: access.context.config.productId ? 400 : 503 }
    );
  }

  try {
    const result = await creemApiRequest(
      access.context.config,
      `/v1/subscriptions/${encodeURIComponent(subscriptionId)}/resume`
    );

    if (!result.ok) {
      console.error("[creem resume] Creem returned", result.status);
      return NextResponse.json(
        { error: "Could not resume the subscription" },
        { status: 502 }
      );
    }

    const update = confirmResumedSubscription({
      expectedSubscriptionId: subscriptionId,
      expectedCustomerId: access.context.creemCustomerId,
      expectedProductId: access.context.config.productId,
      currentPeriodEnd: access.context.currentPeriodEnd,
      payload: result.payload,
    });

    if (!update) {
      return NextResponse.json({
        resumed: false,
        error: "Resume was not confirmed. Your plan was not changed.",
      }, { status: 409 });
    }

    await applyConfirmedBillingUpdate(access.context.hostId, update);
    return NextResponse.json({ resumed: true });
  } catch (err) {
    console.error(
      "[creem resume] request failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json(
      { error: "Could not resume the subscription" },
      { status: 502 }
    );
  }
}
