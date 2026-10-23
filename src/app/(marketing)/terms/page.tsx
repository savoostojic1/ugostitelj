import type { Metadata } from "next";
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
  title: "Terms of service",
  description:
    "Terms for using Hostvia: host accounts, booking sites, calendar sync, and the Free and Pro subscription plans.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of service" updated={LEGAL_EFFECTIVE_DATE}>
      <LegalSection id="acceptance" title="1. Acceptance of these terms">
        <p>
          These terms apply to the Hostvia service at hostvia.me, including the
          host dashboard, public booking sites, and related pages. By creating
          an account, signing in, or using the service, you agree to these
          terms. If you do not agree, do not use the service.
        </p>
        <p>
          If you use Hostvia for a business, you confirm that you have authority
          to bind that business. Guests who send a booking inquiry through a
          host&apos;s public page also agree to the parts of these terms that
          apply to that use.
        </p>
      </LegalSection>

      <LegalSection id="operator" title="2. Who provides the service">
        <p>
          Hostvia is the name of the service. The operator has confirmed that
          no registered company runs it. Support for these terms is{" "}
          <LegalMailLink />.
        </p>
        <UnconfirmedOperatorDetails />
      </LegalSection>

      <LegalSection id="service" title="3. The service">
        <p>
          Hostvia.me is an accommodation listing and property-management
          platform for hosts. With an account, a host can:
        </p>
        <LegalList>
          <li>
            Add properties and manage them from a dashboard, including arrivals,
            departures, and a reservation calendar.
          </li>
          <li>
            Import calendars by iCal (ICS) link from Airbnb, Booking.com, or
            another source the host provides, and export an iCal link back to
            those platforms.
          </li>
          <li>
            Add manual bookings and date blocks, and set a base nightly price
            plus prices for selected dates.
          </li>
          <li>
            Publish a booking website with photos, description, availability,
            pricing, location, and a form for booking inquiries.
          </li>
          <li>
            Receive those inquiries in the Hostvia dashboard. A guest uses the
            inquiry form to contact the property owner. The inquiry stays in
            the application for the owner to read and answer.
          </li>
          <li>
            Save reusable guest messages and create team logins with limited
            dashboard access.
          </li>
          <li>Install the dashboard as an app on a supported device.</li>
        </LegalList>
        <p>
          Travelers can look at published listings and contact the property
          owner directly through that inquiry. The owner decides whether to
          accept it and arranges the stay with the guest. Hostvia does not
          confirm the reservation, guarantee the accommodation, or guarantee
          that the owner will accept the inquiry. Hostvia does not collect the
          guest&apos;s payment for the stay and does not charge a commission on
          it.
        </p>
        <p>
          Calendar import depends on the link and the platform that publishes
          it. Hostvia reads the calendar data those links return. It does not
          use a private Airbnb or Booking.com API.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="4. Accounts">
        <p>
          Host registration asks for a full name, email address, and password.
          The account must be confirmed through the email sent at sign-up.
          You can later reset a host password by email. You are responsible for
          keeping the login confidential and for activity under the account.
        </p>
        <p>
          The account owner can create team logins with a username, email, and
          password, and can choose which parts of the dashboard those logins may
          use. Team logins cannot change the subscription. The owner is
          responsible for team logins they create, including resetting those
          passwords from the team-access page. Team logins cannot use the email
          password-reset flow.
        </p>
        <p>
          Information you enter about a property, price, or available date
          should be accurate. Guests rely on the public page the host publishes.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="5. Acceptable use">
        <p>Use the service only for lawful hosting and guest inquiries. You may not:</p>
        <LegalList>
          <li>
            Break the law, or list accommodation you are not allowed to offer.
          </li>
          <li>
            Publish false availability, pricing, or property information, or
            misuse a guest&apos;s name, email, phone number, or message.
          </li>
          <li>
            Attempt to access another host&apos;s account, interfere with the
            service, or probe it for a vulnerability without permission.
          </li>
          <li>
            Upload content you do not have the right to use, including photos
            and descriptions.
          </li>
          <li>
            Resell the service or share one paid subscription across unrelated
            businesses without the operator&apos;s agreement.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="plans" title="6. Plans, price, and renewal">
        <p>
          {`The Free plan has no subscription fee. It includes the features currently available in Hostvia, for up to ${FREE_PLAN_PROPERTY_LIMIT} properties. Free does not turn off the booking site, calendar sync, inquiries, pricing, dashboard, or the other tools in the product. The plan limit in the application is the number of active properties.`}
        </p>
        <p>
          {`Pro is the same product without that property cap. It is one monthly subscription for the whole owner account. Adding properties does not add another Hostvia fee. Checkout sends a single subscription line with quantity 1.`}
        </p>
        <ProSubscriptionPrice />
        <p>
          Pro renews each billing period until the account owner cancels.
          Renewal is charged to the payment method on that Creem subscription.
          The billing page shows the end of the current period when Creem has
          provided that date. A discount, when one is offered, is applied on
          the Creem checkout page.
        </p>
        <p>
          Some accounts may be given Pro access without a Creem subscription.
          That access is granted inside the product and is not a paid plan. It
          does not create an invoice.
        </p>
        <p>
          Only the account owner can start or manage a paid subscription. Team
          logins use the owner&apos;s plan.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="7. Payment processing">
        <p>
          Paid subscriptions are processed by Creem. Choosing Upgrade to Pro
          opens Creem Checkout. The account owner manages the payment method
          and invoices from Pricing plan with Manage billing, which opens the
          Creem customer portal. The same page can schedule cancellation for
          the end of the current period, or resume a cancellation that has not
          taken effect yet.
        </p>
        <p>
          Hostvia stores the Creem customer identifier, subscription
          identifier, plan status, current period end, and whether cancellation
          is scheduled. Card numbers are entered on Creem&apos;s pages. The
          Hostvia database has no field for a card number, and Hostvia forms do
          not ask for one.
        </p>
        <p>
          If a renewal charge fails, Creem may retry it and the subscription
          may show as past due. While the status remains past due, the
          application still treats the account as Pro. If the subscription ends,
          the account returns to the Free plan.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" title="8. Cancellation">
        <p>
          The account owner can cancel Pro from the dashboard: Pricing plan,
          then Cancel at period end. Manage billing opens the Creem customer
          portal for the payment method and invoices. Cancellation is scheduled
          for the end of the current billing period. Pro stays available until
          that date. After the period ends, the account returns to Free.
        </p>
        <p>
          {`On Free, the ${FREE_PLAN_PROPERTY_LIMIT} oldest properties stay active.`}
          Further properties are locked. They are not deleted. Leaving Creem
          Checkout before you pay does not start a subscription.
        </p>
        <p>
          Fees, refunds, and how to ask for a billing review are described in
          the refund and cancellation policy.
        </p>
      </LegalSection>

      <LegalSection id="suspension" title="9. Suspension and termination">
        <p>
          You may stop using Hostvia at any time. Cancel a paid plan as
          described above if you do not want it to renew.
        </p>
        <p>
          The operator may suspend or close an account that materially breaches
          these terms, creates a security risk, or must be closed to comply with
          law. Where it is reasonable and legally allowed, the operator will
          email the account address before or when that happens. Plan limits
          described above can also lock properties without closing the account.
        </p>
        <p>
          There is no self-serve button that deletes a host account. You can
          ask for deletion by emailing <LegalMailLink subject="Account deletion" />.
          Team logins can be removed by the account owner from the team-access
          page.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="10. Availability">
        <p>
          The service is provided as available. Maintenance, outages, and
          failures in hosting, email, or a calendar platform can interrupt
          sync, notifications, or the public page. There is no published uptime
          commitment in the application.
        </p>
        <p>
          Check calendars in the source platform as well, especially before you
          confirm a stay. Imported events can be late or incomplete when the
          external calendar link is.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="11. Intellectual property">
        <p>
          The Hostvia software, branding, and site design belong to the
          operator. These terms give you a limited right to use them while your
          account is open and you follow these terms.
        </p>
        <p>
          Photos, text, prices, and other material you upload stay yours. You
          give the operator permission to host, store, and display that material
          so the dashboard and your public booking page can work, including
          through the hosting and storage providers used to run the service.
          You can remove public content by editing or unpublishing it in the
          dashboard.
        </p>
        <p>
          Calendar data and inquiry details are used to provide the features you
          or your guests used. Feedback you send may be used to operate and
          improve the service.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="12. Limitation of liability">
        <p>
          Hostvia provides software tools. The accommodation contract is between
          the host and the guest. Outcomes that depend on a third-party
          calendar, on information a host publishes, or on a decision a host
          makes about an inquiry are outside the operator&apos;s control.
        </p>
        <p>
          To the extent applicable law allows a limit, the operator is not
          liable for indirect or consequential loss arising from use of the
          service, including a missed booking, a double booking caused by
          calendar data, lost profit, or a dispute between a host and a guest.
          Where a limit on direct damages is allowed, that liability in a
          subscription period is limited to the fees you paid for Hostvia in
          that period. Free accounts have no subscription fee for that limit to
          apply to.
        </p>
        <p>
          These limits do not apply where the law that covers you forbids them.
          That includes liability for fraud, and for death or personal injury
          caused by negligence, where those rules exist. Mandatory consumer
          rights remain in place. Nothing in these terms asks you to waive a
          statutory right.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes">
        <p>
          Features can change as the product is updated. Prices shown in the
          application can change for future billing periods. A price already
          shown and accepted at checkout applies to the subscription Creem
          creates, until that subscription is changed.
        </p>
        <p>
          These terms can be updated by posting a new version on this page and
          changing the effective date. For a change that materially affects a
          paying subscriber, the operator will make a reasonable effort to email
          the account address before the new version applies. Continuing to use
          the service after the effective date means you accept the updated
          terms. If you do not accept them, cancel the paid plan and stop using
          the account.
        </p>
      </LegalSection>

      <LegalSection id="law" title="14. Governing law and disputes">
        <p>
          The operator&apos;s legal name, registered office, governing law, and
          chosen courts are not published in the application. This page does not
          invent them. Mandatory consumer law in your country of residence still
          applies, including any rule that lets you bring a claim in your local
          courts.
        </p>
        <UnconfirmedOperatorDetails />
        <p>
          Contact <LegalMailLink subject="Terms of service" /> first so a
          billing or account problem can be reviewed. That request does not
          remove a right to go to a court or authority that the law gives you.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="15. Contact">
        <p>
          Support for these terms: <LegalMailLink subject="Terms of service" />.
        </p>
        <RelatedLegalLinks current="/terms" />
      </LegalSection>
    </LegalDocument>
  );
}
