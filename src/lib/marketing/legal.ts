import { marketingFooter } from "@/lib/marketing/content";
import { FREE_PROPERTY_LIMIT } from "@/lib/subscriptions/plans";

/** Date these drafts were prepared. */
export const LEGAL_EFFECTIVE_DATE = "14 October 2026";

/** Confirmed support and privacy address. */
export const LEGAL_SUPPORT_EMAIL = marketingFooter.contact.email;

export const FREE_PLAN_PROPERTY_LIMIT = FREE_PROPERTY_LIMIT;

/**
 * Still required before the pages can name a contracting party.
 * The operator confirmed there is no registered company, so these are
 * personal-operator details, not a company filing.
 */
export const UNCONFIRMED_OPERATOR_DETAILS = [
  "Legal name of the person who operates Hostvia.me",
  "Address for that person",
  "Governing law and the courts used for disputes",
] as const;
