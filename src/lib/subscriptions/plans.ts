export const FREE_PROPERTY_LIMIT = 2;

export const PRO_LAUNCH_PRICE_EUR = 20;
export const PRO_REGULAR_PRICE_EUR = 30;

export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";

export interface SubscriptionRecord {
  subscription_status: SubscriptionStatus;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end?: boolean;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  /** Admin-granted complimentary Pro (no Stripe subscription). */
  pro_access_granted?: boolean;
}
