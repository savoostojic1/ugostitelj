import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { MarketingAccountPrompt } from "@/components/marketing/marketing-account-prompt";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { marketingFooter } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Contact — Hostvia",
  description:
    "Contact the Hostvia team with questions about sign-up, iCal sync or your booking site.",
};

const contactTopics = [
  "Help connecting Airbnb or Booking.com calendars",
  "Setting up your booking site and inquiries",
  "Questions about pricing and plans",
  "Feature suggestions",
  "Partnerships and collaboration",
];

export default function KontaktPage() {
  const email = marketingFooter.contact.email;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We're here to help"
        description="Have a question about setup, features or collaboration? Get in touch — we respond as quickly as we can."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="marketing-card rounded-2xl border border-border bg-card p-8">
            <Mail className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The fastest way to reach us. Describe your question and attach a
              screenshot if needed.
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-4 block text-lg font-semibold text-primary hover:underline"
            >
              {email}
            </a>
            <Button className="mt-6" asChild>
              <a href={`mailto:${email}?subject=Question%20about%20Hostvia`}>
                Send email
              </a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-8">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">How we can help</h2>
            <ul className="mt-4 space-y-3">
              {contactTopics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
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
