import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalDocument,
  LegalList,
  LegalMailLink,
  LegalSection,
  ProSubscriptionPrice,
  RelatedLegalLinks,
  UnconfirmedOperatorDetails,
} from "@/components/marketing/legal-document";
import { pageMetadata } from "@/lib/seo/site";
import {
  FREE_PLAN_PROPERTY_LIMIT,
  LEGAL_EFFECTIVE_DATE,
} from "@/lib/marketing/legal";

export const metadata: Metadata = pageMetadata({
  title: "Refund and cancellation policy",
  description:
    "How to cancel a Hostvia Pro subscription, when access ends, and how billing mistakes and refund requests are reviewed.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <LegalDocument
      title="Refund and cancellation policy"
      updated={LEGAL_EFFECTIVE_DATE}
    >
      <LegalSection id="scope" title="1. What this policy covers">
        <p>
          This policy covers fees paid to Hostvia for the Pro subscription. It
          does not cover money a guest pays a host for a stay. Hostvia does not
          process those guest payments.
        </p>
        <p>
          The operator has not published an automatic refund for every
          cancellation or change of mind. Requests are reviewed as described
          below. This policy does not remove a refund, withdrawal, or cooling-off
          right that mandatory consumer law gives you.
        </p>
        <UnconfirmedOperatorDetails />
      </LegalSection>

      <LegalSection id="plans" title="2. Plans and billing">
        <p>
          {`The Free plan has no subscription fee and includes up to ${FREE_PLAN_PROPERTY_LIMIT} properties, with the same product features as a paid account. There is no Hostvia charge to refund on Free.`}
        </p>
        <p>
          Pro is one monthly Creem subscription for the whole owner account.
          The fee is not charged again for each property. It renews each period
          until it is canceled. Invoices and the payment method are available
          in the Creem customer portal. A discount applied on Creem Checkout
          can change the amount on the receipt. Complimentary Pro, when the
          operator grants it without Creem, is not a payment and has no charge
          to refund.
        </p>
        <ProSubscriptionPrice />
      </LegalSection>

      <LegalSection id="how-to-cancel" title="3. How to cancel">
        <p>The account owner can cancel a paid subscription in the product:</p>
        <LegalList>
          <li>Sign in to the host dashboard.</li>
          <li>Open Pricing plan.</li>
          <li>
            Choose Cancel at period end. Manage billing opens the Creem
            customer portal for the payment method and invoices.
          </li>
        </LegalList>
        <p>
          Team logins cannot open billing. Only the account owner can cancel.
          If Cancel at period end is unavailable, email{" "}
          <LegalMailLink subject="Billing help" /> from the account email and
          include the date you want the subscription canceled.
        </p>
        <p>
          Closing the Creem Checkout window before you pay does not create a
          subscription. That is an abandoned upgrade, not a cancellation of a
          plan that was charged.
        </p>
      </LegalSection>

      <LegalSection id="effective" title="4. When cancellation takes effect">
        <p>
          Cancellation from the billing page is scheduled for the end of the
          current billing period. The dashboard shows that the plan is canceling
          and, when Creem has provided the date, the day Pro remains active
          until.
        </p>
        <p>
          Access to Pro continues until that period ends. The subscription does
          not renew after that. When the period ends, the account returns to
          the Free plan.
        </p>
        <p>
          {`Listings are not deleted. On Free, the ${FREE_PLAN_PROPERTY_LIMIT} oldest properties stay active and any others are locked until the account is on Pro again.`}
        </p>
      </LegalSection>

      <LegalSection id="billing-help" title="5. Billing problems">
        <p>
          For a wrong amount, a charge you do not recognize, a failed renewal,
          or a portal you cannot open, email{" "}
          <LegalMailLink subject="Billing problem" />. Use the email on the
          Hostvia account. Support will look up the Creem subscription linked
          to that account.
        </p>
        <p>
          If a renewal payment fails, Creem may retry the charge and the
          subscription may be marked past due. The application keeps Pro access
          while the subscription is past due. If Creem ends the subscription,
          the account returns to Free as described above.
        </p>
        <p>
          You can also contact the card issuer about a charge. Hostvia will use
          the subscription records it holds if a payment dispute needs a
          response. Do not send a full card number by email.
        </p>
      </LegalSection>

      <LegalSection id="duplicates" title="6. Duplicate charges and accidental payments">
        <p>
          Email <LegalMailLink subject="Duplicate or accidental charge" /> if
          you were charged twice for the same period or you completed checkout
          by mistake. Include the information in the request section below.
          Support will compare the request with the Creem invoices for the
          account.
        </p>
        <p>
          The operator has not set an automatic refund for duplicate charges,
          accidental payments, or cancellation. This policy does not refuse
          those requests, and it does not promise that each one is refunded.
          Any right that mandatory consumer law gives you still applies.
        </p>
      </LegalSection>

      <LegalSection id="review" title="7. How refund requests are reviewed">
        <p>
          There is no refund button inside Hostvia. Email{" "}
          <LegalMailLink subject="Refund request" /> and a person reviews the
          request against the account and the Creem invoices. You will receive
          a reply at the email you wrote from, or at the account email if that
          is different.
        </p>
        <p>
          The operator has not chosen a commercial rule for refunding the
          current period, a change of mind, or a billing mistake. Canceling
          stops the next renewal and leaves Pro active until the end of the
          period already paid for. That description is not a decision to keep
          the fee, and it is not a promise to return it.
        </p>
        <p>
          Where mandatory law requires a charge to be returned, that right
          remains. Where the law does not require a refund, the operator still
          needs to decide the commercial rule before this page can promise one.
        </p>
      </LegalSection>

      <LegalSection id="service-problems" title="8. Service problems">
        <p>
          If sync, the dashboard, or the booking page fails, email{" "}
          <LegalMailLink subject="Service problem" /> with what you were doing,
          the property involved, and when it happened. Support will investigate.
        </p>
        <p>
          A service problem is handled first by fixing the fault. It does not
          by itself create an automatic refund. If Pro was unavailable for a
          substantial part of a period you already paid for, you can ask for
          that period to be reviewed for a proportional refund or credit. The
          outcome depends on the outage and on the law that applies to you.
        </p>
        <p>
          Calendar differences that come from an Airbnb, Booking.com, or other
          external iCal link are investigated as sync issues. Those platforms
          control the feed they publish.
        </p>
      </LegalSection>

      <LegalSection id="statutory-rights" title="9. Statutory consumer rights">
        <p>
          If you are a consumer, mandatory rights in your country of residence
          remain available. That can include a cooling-off or withdrawal right
          for an online subscription, and any remedy the law gives you when a
          paid digital service is not supplied. Hostvia does not ask you to
          waive those rights, and canceling renewal from the billing page is
          not a waiver.
        </p>
        <p>
          The application does not name the operator&apos;s country of
          establishment, so this page does not state a specific statute or a
          specific number of days. If a withdrawal right applies, email{" "}
          <LegalMailLink subject="Withdrawal request" /> within the time your
          law allows and state that you are exercising that right. The request
          will be handled under that law, separately from the ordinary
          end-of-period cancellation described above.
        </p>
        <p>
          Nothing in the{" "}
          <Link href="/terms" className="text-primary hover:underline">
            terms of service
          </Link>{" "}
          removes these rights.
        </p>
      </LegalSection>

      <LegalSection id="submit" title="10. How to submit a request">
        <p>
          Email <LegalMailLink subject="Refund request" />. Include:
        </p>
        <LegalList>
          <li>The email address on the Hostvia account.</li>
          <li>The account name, if you use one.</li>
          <li>The charge date and amount, as shown on the Creem receipt or your statement.</li>
          <li>The invoice or receipt identifier, if you have it.</li>
          <li>
            Whether the request is a duplicate charge, an accidental payment, a
            withdrawal right, a service problem, or something else.
          </li>
          <li>Whether you have already canceled from the billing page.</li>
        </LegalList>
        <p>
          Do not include a full card number or card security code. The last
          four digits are enough if you need to identify the payment method.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="11. Contact">
        <p>
          Billing and refund questions:{" "}
          <LegalMailLink subject="Billing help" />.
        </p>
        <RelatedLegalLinks current="/refund-policy" />
      </LegalSection>
    </LegalDocument>
  );
}
