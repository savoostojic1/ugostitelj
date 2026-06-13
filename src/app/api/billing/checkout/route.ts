import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ensureStripeCustomer,
} from "@/lib/stripe/sync-subscription";
import {
  getStripe,
  getStripePriceId,
  hasStripeConfig,
} from "@/lib/stripe/stripe";
import { getSiteBaseUrl } from "@/lib/public/site-url";

export async function POST() {
  if (!hasStripeConfig()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID.",
      },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: teamRow } = await supabase
    .from("team_access_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (teamRow) {
    return NextResponse.json(
      { error: "Only the account owner can manage billing" },
      { status: 403 }
    );
  }

  const { data: profile } = await supabase
    .from("host_profiles")
    .select("stripe_customer_id, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = await ensureStripeCustomer(
    user.id,
    user.email,
    profile?.stripe_customer_id
  );

  const stripe = getStripe();
  const baseUrl = getSiteBaseUrl();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: getStripePriceId(), quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard/properties?upgrade=canceled`,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
