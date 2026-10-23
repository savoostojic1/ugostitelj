import type { Metadata } from "next";
import {
  LegalDocument,
  LegalList,
  LegalMailLink,
  LegalSection,
  RelatedLegalLinks,
  UnconfirmedOperatorDetails,
} from "@/components/marketing/legal-document";
import { LEGAL_EFFECTIVE_DATE } from "@/lib/marketing/legal";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "What personal data Hostvia collects for host accounts, booking inquiries, calendars, and Creem subscriptions, and how to request access or deletion.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy policy" updated={LEGAL_EFFECTIVE_DATE}>
      <LegalSection id="introduction" title="1. Introduction">
        <p>
          This policy describes personal data processed by the Hostvia
          application at hostvia.me. It covers hosts, team logins, and guests
          who submit a booking inquiry. It is based on the data the application
          actually collects and the providers the code uses.
        </p>
        <p>
          This policy does not claim a particular compliance certification.
          Rights and legal bases below apply where the relevant law gives them
          to you.
        </p>
      </LegalSection>

      <LegalSection id="controller" title="2. Who is responsible">
        <p>
          The operator of Hostvia decides why account, property, and inquiry
          data are processed. The operator has confirmed that there is no
          registered company. Privacy requests go to{" "}
          <LegalMailLink subject="Privacy request" />, which is the confirmed
          support and privacy address.
        </p>
        <UnconfirmedOperatorDetails />
      </LegalSection>

      <LegalSection id="data-collected" title="3. Personal data collected">
        <p>Depending on how you use Hostvia, the service processes:</p>
        <LegalList>
          <li>
            <strong className="font-medium text-foreground">Host account.</strong>{" "}
            Full name, email address, and the password you set at registration.
            Email confirmation and password reset are sent through the
            authentication provider.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Public host profile.
            </strong>{" "}
            Username, business name, description, contact email, phone,
            location, map link, logo, cover image, and social links you choose
            to publish.
          </li>
          <li>
            <strong className="font-medium text-foreground">Properties.</strong>{" "}
            Names, addresses, descriptions, capacity, amenities, house rules,
            prices, photos, and whether a listing is public.
          </li>
          <li>
            <strong className="font-medium text-foreground">Calendars.</strong>{" "}
            iCal links you add, sync status, and reservation records imported
            from those calendars or entered manually. Imported titles can
            include guest names supplied by the other platform. Manual bookings
            can include a title, phone number, dates, source, and price.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Booking inquiries.
            </strong>{" "}
            Guest name, email, phone, stay dates, guest count, optional
            message, and the property the inquiry concerns.
          </li>
          <li>
            <strong className="font-medium text-foreground">Team access.</strong>{" "}
            Username, login email, display name, permissions, and the password
            set for that login.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Saved messages.
            </strong>{" "}
            Titles and text you store for reuse with guests.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Push notifications.
            </strong>{" "}
            If you enable them, the browser push endpoint, keys, and user agent.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Subscription records.
            </strong>{" "}
            Creem customer and subscription identifiers, plan status, period
            end, and whether cancellation is scheduled at the period end.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="authentication" title="4. Account and authentication data">
        <p>
          Host sign-in uses Supabase Authentication. The host account password
          is handled there. Hostvia&apos;s own tables do not keep a second copy
          of that host password.
        </p>
        <p>
          Team-login passwords are stored so the property owner can view and
          reset them on the team-access page. Team logins cannot reset that
          password by email.
        </p>
        <p>
          A short-lived cookie is set while a host password reset is in
          progress. Session cookies keep you signed in.
        </p>
      </LegalSection>

      <LegalSection id="submitted" title="5. Information submitted through the service">
        <p>
          Hosts submit property, calendar, pricing, profile, message, and team
          data in the dashboard. Guests submit inquiry fields on the public
          booking page. Those inquiries are stored in Hostvia and shown in the
          host dashboard. The host and guest continue the conversation from
          there. Hostvia does not send booking inquiries through Telegram.
        </p>
        <p>
          If inquiry email is configured, the same inquiry can also be emailed
          to the host&apos;s contact address, or to the host account email when
          no contact address is set. That email is sent through Resend. Browser
          push, when the host has allowed it, sends a short alert to the
          host&apos;s device.
        </p>
        <p>
          Photos and logos are stored in Supabase Storage so they can be shown
          on the booking page.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="6. Payment and subscription metadata">
        <p>
          Paid plans use Creem Checkout and the Creem customer portal. Both
          are Creem-hosted pages. Hostvia receives subscription status from
          Creem webhooks and stores the identifiers and status described above.
        </p>
        <p>
          The Hostvia database does not have a payment-card field, and Hostvia
          pages do not ask you to enter a card number. Card details are
          collected by Creem. Creem may also hold your name, email, payment
          method, invoices, and tax information under Creem&apos;s own terms.
          This policy does not restate Creem&apos;s policy.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="7. Cookies and storage on your device">
        <p>The application uses:</p>
        <LegalList>
          <li>
            Authentication cookies from Supabase, so a signed-in session can
            continue.
          </li>
          <li>
            A password-recovery cookie that lasts about 15 minutes during a
            host password reset.
          </li>
          <li>
            A cookie that records when the site is opened as an installed app,
            so the installed-app layout can be applied. It can last up to one
            year.
          </li>
          <li>
            Local storage for interface state, such as the last calendar sync
            time, a dismissed setup checklist, and a dismissed install prompt.
          </li>
          <li>
            Google Analytics, which is loaded in the browser and may set
            analytics cookies and collect usage data such as pages visited.
          </li>
          <li>
            Vercel Analytics, which is enabled to measure visits to the site.
          </li>
        </LegalList>
        <p>
          The public site does not include a separate cookie-choices banner.
          Browser controls can block cookies. Blocking authentication cookies
          will prevent sign-in. An internal admin sign-in, which is not part of
          the host or guest product, uses its own cookie.
        </p>
      </LegalSection>

      <LegalSection id="purposes" title="8. Purposes and legal bases">
        <p>Data is used to:</p>
        <LegalList>
          <li>Create and secure accounts, including email confirmation and password reset.</li>
          <li>Provide the dashboard, calendars, booking page, inquiries, and team access.</li>
          <li>Send inquiry alerts you have enabled.</li>
          <li>Bill for Pro and apply the Free or Pro property limit.</li>
          <li>Respond to support, privacy, and billing requests.</li>
          <li>Measure site use and protect the service from abuse.</li>
        </LegalList>
        <p>
          Where a data-protection law requires a legal basis, the relevant
          bases are: performing the service you asked for; legitimate interests
          in keeping the service secure and understanding how the public site
          is used, where that basis is available and your interests do not
          override it; consent, including the browser permission for push
          notifications and any consent an analytics provider requires; and a
          legal obligation where one applies to a billing or disclosure
          request.
        </p>
      </LegalSection>

      <LegalSection id="providers" title="9. Service providers">
        <p>
          These providers are used by the application. They process data only as
          needed for the role described:
        </p>
        <LegalList>
          <li>
            <strong className="font-medium text-foreground">Supabase</strong> —
            authentication, database, and file storage.
          </li>
          <li>
            <strong className="font-medium text-foreground">Vercel</strong> —
            hosting and Vercel Analytics.
          </li>
          <li>
            <strong className="font-medium text-foreground">Creem</strong> —
            subscription checkout, customer portal, invoices, and webhook
            updates. Used for Hostvia plans, not for guest stay payments.
          </li>
          <li>
            <strong className="font-medium text-foreground">Google Analytics</strong>{" "}
            — site measurement in the browser.
          </li>
          <li>
            <strong className="font-medium text-foreground">Resend</strong> —
            booking-inquiry email to the host, when that email feature is
            configured. The inquiry itself remains in the Hostvia dashboard.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Airbnb, Booking.com, or another calendar host
            </strong>{" "}
            — Hostvia fetches the iCal URL the host supplies. Those platforms
            receive whatever their own export link records.
          </li>
        </LegalList>
        <p>
          Hosts are responsible for guest information they export or copy out of
          Hostvia, and for the contact details they publish on their booking
          page.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="10. International transfers">
        <p>
          Supabase, Vercel, Creem, Google, and Resend can process data in
          countries other than the country where you live, including the United
          States and other countries where those companies operate. The
          application code does not set or publish a single data-region
          choice. Transfer tools those providers offer, such as contracts, are
          described in their own documentation. This policy does not claim a
          specific transfer mechanism beyond the providers listed here.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="11. Retention and deletion">
        <p>
          Account, property, calendar, inquiry, message, and subscription
          records are kept while the account exists and the feature needs them.
          The application does not publish a fixed retention period in days or
          years.
        </p>
        <p>
          You can edit or remove properties, calendar links, inquiries you
          control, saved messages, public profile fields, and team logins in
          the dashboard. Removing a team login deletes that team user. There is
          no self-serve control that deletes the whole host account. Email{" "}
          <LegalMailLink subject="Account deletion" /> to ask for account
          deletion. Say which account email to delete.
        </p>
        <p>
          A guest can email the same address to ask about an inquiry. Include
          the name, email, and approximate date used on the form so the record
          can be found. The host also holds that inquiry in their dashboard.
        </p>
        <p>
          Creem may keep billing records under Creem&apos;s rules after a
          subscription ends. Deleting a Hostvia account does not, by itself,
          erase Creem&apos;s copy of invoices.
        </p>
      </LegalSection>

      <LegalSection id="security" title="12. Security">
        <p>
          Host data in the database is protected with row-level access rules so
          that an account is limited to its own records, and team logins are
          limited to the host that created them. Creem webhooks are checked
          with a signature before subscription status is updated. Traffic is
          served over the hosting provider&apos;s HTTPS setup. Payment card
          entry happens on Creem&apos;s pages.
        </p>
        <p>
          These measures reduce risk. They are not a guarantee that unauthorized
          access, loss, or a service incident will never happen.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="13. Your privacy rights">
        <p>
          Where applicable law gives you these rights, you can ask to access,
          correct, or delete personal data, to restrict or object to certain
          processing, and to receive a copy of data you provided. You can also
          complain to a data-protection authority in your country. The
          competent authority is not named here because the operator&apos;s
          establishment has not been published.
        </p>
        <p>
          Send the request to <LegalMailLink subject="Privacy request" />. Use
          the account email if you have an account, and describe what you want
          changed or deleted. Identity may need to be confirmed before the
          request is completed. The response will follow the timing required by
          the law that applies. Some records may be kept when the law requires
          it, including billing records held by Creem.
        </p>
      </LegalSection>

      <LegalSection id="children" title="14. Children">
        <p>
          Hostvia is a tool for people operating accommodation. It is not
          directed at children, and host registration does not ask for a date
          of birth. The inquiry form also does not ask for age. If you believe
          a child&apos;s information was submitted, email{" "}
          <LegalMailLink subject="Children's privacy" /> with enough detail to
          find the record.
        </p>
      </LegalSection>

      <LegalSection id="updates" title="15. Updates to this policy">
        <p>
          Updates are posted on this page with a new effective date. A change
          that materially affects how account data is used will be accompanied
          by a reasonable effort to email registered hosts.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="16. Contact">
        <p>
          Privacy inquiries: <LegalMailLink subject="Privacy request" />.
        </p>
        <RelatedLegalLinks current="/privacy" />
      </LegalSection>
    </LegalDocument>
  );
}
