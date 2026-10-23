import { NextResponse } from "next/server";
import {
  applyConfirmedBillingUpdate,
  creemApiRequest,
} from "@/lib/creem/creem-api";
import { requireCreemBillingOwner } from "@/lib/creem/require-owner";
import {
  buildCreemScheduledCancelBody,
  confirmScheduledCancellation,
  isSafeCreemObjectId,
} from "@/lib/creem/subscription-actions";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireCreemBillingOwner("cancel");
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
      `/v1/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
      buildCreemScheduledCancelBody()
    );

    if (!result.ok) {
      console.error("[creem cancel] Creem returned", result.status);
      return NextResponse.json(
        { error: "Could not schedule cancellation" },
        { status: 502 }
      );
    }

    const update = confirmScheduledCancellation({
      expectedSubscriptionId: subscriptionId,
      expectedCustomerId: access.context.creemCustomerId,
      expectedProductId: access.context.config.productId,
      currentStatus: access.context.subscriptionStatus,
      currentPeriodEnd: access.context.currentPeriodEnd,
      payload: result.payload,
    });

    if (!update) {
      return NextResponse.json({
        scheduled: false,
        error: "Cancellation was not confirmed. Your plan was not changed.",
      }, { status: 409 });
    }

    await applyConfirmedBillingUpdate(access.context.hostId, update);
    return NextResponse.json({
      scheduled: true,
      currentPeriodEnd: update.currentPeriodEnd,
    });
  } catch (err) {
    console.error(
      "[creem cancel] request failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json(
      { error: "Could not schedule cancellation" },
      { status: 502 }
    );
  }
}
