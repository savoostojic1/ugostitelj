import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy — Hostvia",
  description: "How Hostvia collects, uses and protects your data.",
};

export default function PrivatnostPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="marketing-eyebrow mb-4">Legal</p>
      <h1 className="marketing-heading text-3xl md:text-4xl">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="prose-marketing mt-10 space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Introduction</h2>
          <p className="mt-3 leading-relaxed">
            Hostvia (&ldquo;we&rdquo;, &ldquo;the platform&rdquo;) respects your
            privacy. This policy explains what data we collect, how we use it and
            your rights when you use our service as a host or as a guest sending
            a booking inquiry.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Data we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <strong className="text-foreground">Host account:</strong> email,
              password (hashed), business name, contact details, profile and
              unit settings.
            </li>
            <li>
              <strong className="text-foreground">Accommodation data:</strong>{" "}
              unit names, prices, calendar data, photos, descriptions and
              location.
            </li>
            <li>
              <strong className="text-foreground">Booking inquiries:</strong>{" "}
              guest name, email, phone and message that the guest voluntarily
              enters on the host&apos;s public site.
            </li>
            <li>
              <strong className="text-foreground">Technical data:</strong> IP
              address, device type and basic logs required to operate and secure
              the service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            How we use data
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>Providing and maintaining the service (calendar, booking site, inquiries)</li>
            <li>Syncing iCal calendars with third-party platforms</li>
            <li>Communicating with hosts about their account and support</li>
            <li>Improving platform security and functionality</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Data sharing
          </h2>
          <p className="mt-3 leading-relaxed">
            We do not sell your data. Booking inquiries sent by a guest go
            directly to the host whose public site they visit. We use trusted
            service providers (e.g. hosting, database) solely to operate the
            platform, under appropriate data processing agreements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Data retention
          </h2>
          <p className="mt-3 leading-relaxed">
            We retain data while you have an active account or as needed to
            provide the service. You can request account deletion by contacting
            us via the email on the{" "}
            <Link href="/kontakt" className="text-primary hover:underline">
              Contact
            </Link>{" "}
            page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p className="mt-3 leading-relaxed">
            You have the right to access, correct and delete your data, as well
            as the right to object to processing in accordance with applicable
            data protection laws. To exercise your rights, contact us at{" "}
            <a
              href="mailto:hello@hostvia.me"
              className="text-primary hover:underline"
            >
              hello@hostvia.me
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-3 leading-relaxed">
            For privacy questions, email{" "}
            <a
              href="mailto:hello@hostvia.me"
              className="text-primary hover:underline"
            >
              hello@hostvia.me
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
