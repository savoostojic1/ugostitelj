import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service — Hostvia",
  description: "Terms of use for the Hostvia platform for hosts and guests.",
};

export default function UsloviPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="marketing-eyebrow mb-4">Legal</p>
      <h1 className="marketing-heading text-3xl md:text-4xl">
        Terms of service
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="prose-marketing mt-10 space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Acceptance of terms
          </h2>
          <p className="mt-3 leading-relaxed">
            By using the Hostvia platform (&ldquo;Service&rdquo;), you accept
            these terms. If you do not agree, do not use the Service. We provide
            the Service to short-term rental hosts for managing calendars and
            public pages for booking inquiries.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. Account and responsibility
          </h2>
          <p className="mt-3 leading-relaxed">
            You are responsible for the accuracy of information you enter,
            account security and all activity on your account. You must enter
            accurate details about accommodation, pricing and availability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. Nature of the service
          </h2>
          <p className="mt-3 leading-relaxed">
            Hostvia is not a travel agency or payment processor. We provide
            tools for calendar sync and receiving booking inquiries. The
            accommodation agreement is between host and guest — we are not a
            party to that agreement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Booking inquiries
          </h2>
          <p className="mt-3 leading-relaxed">
            Inquiries sent by guests through the public site are not guaranteed
            reservations. The host independently decides whether to accept an
            inquiry and arranges payment details directly with the guest.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. iCal sync
          </h2>
          <p className="mt-3 leading-relaxed">
            iCal integration depends on third-party platforms (Airbnb,
            Booking.com). We do not guarantee instant sync in all situations. We
            recommend checking your calendars regularly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Prohibited use
          </h2>
          <p className="mt-3 leading-relaxed">
            You may not use the Service for illegal activities, entering false
            data, misusing guest data or attempting to disrupt platform
            operations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            7. Intellectual property
          </h2>
          <p className="mt-3 leading-relaxed">
            The platform, design and software are owned by Hostvia. Content
            uploaded by hosts (photos, descriptions) remains the property of the
            host, with a license to display it on the public site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            8. Limitation of liability
          </h2>
          <p className="mt-3 leading-relaxed">
            The Service is provided &ldquo;as is&rdquo;. We are not liable for
            losses caused by sync errors, missed reservations or disputes between
            hosts and guests, except to the extent required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            9. Changes to terms
          </h2>
          <p className="mt-3 leading-relaxed">
            We may update these terms. We will notify registered users of
            significant changes. Continued use after changes means acceptance of
            the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p className="mt-3 leading-relaxed">
            Questions about these terms:{" "}
            <a
              href="mailto:hello@hostvia.me"
              className="text-primary hover:underline"
            >
              hello@hostvia.me
            </a>
            . More about data in our{" "}
            <Link href="/privatnost" className="text-primary hover:underline">
              Privacy policy
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
