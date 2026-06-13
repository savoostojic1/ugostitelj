import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteBaseUrl } from "@/lib/public/site-url";
import { ensureStripeCustomer } from "@/lib/stripe/sync-subscription";
import { getStripe, hasStripeConfig } from "@/lib/stripe/stripe";

export async function POST() {
  if (!(await hasStripeConfig())) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
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
    .select(
      "stripe_customer_id, stripe_subscription_id, pro_access_granted, subscription_status"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.pro_access_granted) {
    return NextResponse.json(
      { error: "Complimentary Pro is not managed through Stripe." },
      { status: 400 }
    );
  }

  if (!profile?.stripe_subscription_id && profile?.subscription_status === "free") {
    return NextResponse.json(
      { error: "No active Stripe subscription found." },
      { status: 400 }
    );
  }

  const customerId = await ensureStripeCustomer(
    user.id,
    user.email,
    profile?.stripe_customer_id
  );

  const stripe = await getStripe();
  const baseUrl = getSiteBaseUrl();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/dashboard/billing?portal=return`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not open billing portal" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
