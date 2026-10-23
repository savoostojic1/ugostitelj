export const FREE_PROPERTY_LIMIT = 2;

/** Flat monthly Pro price for the whole owner account. */
export const PRO_MONTHLY_PRICE_USD = 20;

export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";

export interface SubscriptionRecord {
  subscription_status: SubscriptionStatus;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end?: boolean;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  creem_customer_id?: string | null;
  creem_subscription_id?: string | null;
  /** Admin-granted complimentary Pro (no paid subscription). */
  pro_access_granted?: boolean;
}
