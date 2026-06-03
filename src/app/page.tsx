import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Layers,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarDays className="h-5 w-5 text-primary" />
            Ugostitelj
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-24 text-center md:py-32">
          <p className="mb-4 text-sm font-medium text-primary">
            Property calendar for short-term hosts
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            One calendar for every booking platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Connect Airbnb and Booking.com iCal feeds. See every reservation in a
            beautiful unified calendar — no direct API integrations required.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-card/50 py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Multiple properties",
                desc: "Manage every rental from a single dashboard with per-property calendars.",
              },
              {
                icon: RefreshCw,
                title: "iCal sync",
                desc: "Paste your Airbnb or Booking ICS URL and sync reservations instantly.",
              },
              {
                icon: Shield,
                title: "No platform APIs",
                desc: "Calendar-only integration — simple, reliable, and host-friendly.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <f.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h2 className="text-2xl font-semibold">Ready to unify your bookings?</h2>
          <p className="mt-2 text-muted-foreground">
            Create a property, connect your iCal URLs, and see reservations appear.
          </p>
          <Button className="mt-8" size="lg" asChild>
            <Link href="/register">Create your account</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Ugostitelj
      </footer>
    </div>
  );
}
