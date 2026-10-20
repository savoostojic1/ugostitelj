import type { ReactNode } from "react";
import Link from "next/link";
import {
  LEGAL_SUPPORT_EMAIL,
  UNCONFIRMED_OPERATOR_DETAILS,
} from "@/lib/marketing/legal";
import { PRO_MONTHLY_PRICE_USD } from "@/lib/subscriptions/plans";

export function LegalDocument({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="marketing-eyebrow mb-4">Legal</p>
      <h1 className="marketing-heading text-3xl md:text-4xl">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Effective date: {updated}
      </p>
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <h2 id={id} className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

export function LegalMailLink({
  subject,
  children,
}: {
  subject?: string;
  children?: ReactNode;
}) {
  const href = subject
    ? `mailto:${LEGAL_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${LEGAL_SUPPORT_EMAIL}`;

  return (
    <a href={href} className="text-primary hover:underline">
      {children ?? LEGAL_SUPPORT_EMAIL}
    </a>
  );
}

export function UnconfirmedOperatorDetails() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-medium text-foreground">Not yet published</p>
      <p className="mt-2">
        The operator has confirmed that no registered company operates
        Hostvia.me. This page does not invent a company name, registration
        number, or registered office. The service is offered under the name
        Hostvia (hostvia.me). Support and privacy mail is {LEGAL_SUPPORT_EMAIL}.
      </p>
      <p className="mt-2">These operator details are still unpublished:</p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        {UNCONFIRMED_OPERATOR_DETAILS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ProSubscriptionPrice() {
  return (
    <p>
      {`Pro is $${PRO_MONTHLY_PRICE_USD} per month for the whole owner account. The fee does not increase with the number of properties. Checkout is one Stripe subscription.`}
    </p>
  );
}

const relatedPolicies = [
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/refund-policy", label: "Refund and cancellation policy" },
] as const;

export function RelatedLegalLinks({ current }: { current: string }) {
  return (
    <nav aria-label="Related policies">
      <p className="font-medium text-foreground">Related policies</p>
      <ul className="mt-3 space-y-2">
        {relatedPolicies
          .filter((item) => item.href !== current)
          .map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-primary hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        <li>
          <Link href="/contact" className="text-primary hover:underline">
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
