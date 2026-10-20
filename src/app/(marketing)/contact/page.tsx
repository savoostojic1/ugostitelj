import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { MarketingAccountPrompt } from "@/components/marketing/marketing-account-prompt";
import { MarketingBreadcrumbs } from "@/components/marketing/marketing-breadcrumbs";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { marketingFooter } from "@/lib/marketing/content";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Email hello@hostvia.me with questions about setup, iCal calendars, the inquiry site, or pricing.",
  path: "/contact",
});

const contactTopics = [
  "Connecting an Airbnb or Booking.com calendar",
  "Publishing the inquiry site",
  "The Free plan and Pro",
  "Something in the product that is not working as described",
];

export default function ContactPage() {
  const email = marketingFooter.contact.email;

  return (
    <>
      <MarketingBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />
      <PageHero
        eyebrow="Contact"
        title="Email the people who build Hostvia"
        description="Questions about setup, calendars, or billing go to the address below. There is no separate priority-support queue."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <Mail className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Describe the question and include a screenshot if it helps. This
              inbox is the contact published on the site.
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-4 block text-lg font-semibold text-primary hover:underline"
            >
              {email}
            </a>
            <Button className="mt-6" asChild>
              <a href={`mailto:${email}?subject=Question%20about%20Hostvia`}>Send email</a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-8">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Useful topics</h2>
            <ul className="mt-4 space-y-3">
              {contactTopics.map((topic) => (
                <li key={topic} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <MarketingAccountPrompt />
      </section>
    </>
  );
}
