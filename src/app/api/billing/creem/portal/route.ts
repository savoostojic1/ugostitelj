import { NextResponse } from "next/server";
import { creemApiRequest } from "@/lib/creem/creem-api";
import { requireCreemBillingOwner } from "@/lib/creem/require-owner";
import {
  buildCreemPortalBody,
  isSafeCreemObjectId,
  readCreemCustomerPortalLink,
} from "@/lib/creem/subscription-actions";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireCreemBillingOwner("portal");
  if (!access.ok) return access.response;

  const customerId = access.context.creemCustomerId;
  if (!isSafeCreemObjectId(customerId)) {
    return NextResponse.json({ error: "No billing customer found." }, { status: 400 });
  }

  try {
    const result = await creemApiRequest(
      access.context.config,
      "/v1/customers/billing",
      buildCreemPortalBody(customerId)
    );
    const url = readCreemCustomerPortalLink(result.payload);
    if (!result.ok || !url) {
      console.error("[creem portal] Creem returned", result.status);
      return NextResponse.json(
        { error: "Could not open the billing portal" },
        { status: 502 }
      );
    }
    return NextResponse.json({ url });
  } catch (err) {
    console.error(
      "[creem portal] request failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json(
      { error: "Could not open the billing portal" },
      { status: 502 }
    );
  }
}
