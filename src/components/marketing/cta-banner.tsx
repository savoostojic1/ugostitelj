import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="px-4 py-16 md:px-8 md:py-24">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600" />
        <div className="relative px-8 py-14 text-center md:px-16 md:py-16">
          <h2 className="marketing-heading text-2xl text-white md:text-3xl">
            Ready to launch your booking website?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            Start free. Connect your calendars. Publish your site. Receive direct
            bookings without platform fees.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-violet-700 transition hover:bg-white/90"
          >
            Start free today
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
