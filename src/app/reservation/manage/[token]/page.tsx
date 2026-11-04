import type { Metadata } from "next";
import Link from "next/link";
import { ManageReservation } from "@/components/reservation/manage-reservation";
import { loadGuestReservation } from "@/lib/reservations/load-guest-reservation";
import { isManageTokenShape } from "@/lib/reservations/guest-access";
import { consumePublicRateLimit } from "@/lib/security/consume-rate-limit";
import {
  clientIpFromHeaders,
  GUEST_VIEW_LIMIT,
  GUEST_VIEW_WINDOW_SECONDS,
} from "@/lib/security/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage reservation",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site public-page-bg min-h-screen text-[var(--public-fg)]">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 py-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          hostvia<span className="text-[var(--public-accent)]">.me</span>
        </Link>
      </header>
      <main className="mx-auto w-full max-w-lg px-4 pb-16">{children}</main>
    </div>
  );
}

function Notice({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="public-card px-5 py-8 md:px-8">
      <p className="public-label">Reservation</p>
      <h1 className="public-heading mt-3 text-3xl">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--public-muted)]">{body}</p>
    </section>
  );
}

export default async function ManageReservationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const headerStore = await headers();
  const limited = await consumePublicRateLimit(
    "guest-view",
    clientIpFromHeaders(headerStore),
    GUEST_VIEW_LIMIT,
    GUEST_VIEW_WINDOW_SECONDS
  );

  if (limited === "deny") {
    return (
      <Shell>
        <Notice
          title="Please wait"
          body="Too many attempts from this network. Wait a few minutes, then open the link from your email again. If you need help sooner, contact the property owner."
        />
      </Shell>
    );
  }

  if (!isManageTokenShape(token)) {
    return (
      <Shell>
        <Notice
          title="Link not valid"
          body="This reservation link is not valid. Contact the property owner directly, or send a new request from their booking site."
        />
      </Shell>
    );
  }

  const view = await loadGuestReservation(token);

  if (view.state === "expired") {
    return (
      <Shell>
        <Notice
          title="Link expired"
          body="This reservation link has expired. Contact the property owner to check the stay. They can confirm the dates from their Hostvia account."
        />
      </Shell>
    );
  }

  if (view.state === "unavailable") {
    return (
      <Shell>
        <Notice
          title="Temporarily unavailable"
          body="We could not open this reservation right now. Your stay was not changed. Contact the property owner if you need help."
        />
      </Shell>
    );
  }

  if (view.state !== "active") {
    return (
      <Shell>
        <Notice
          title="Link not valid"
          body="This reservation link is not valid. Contact the property owner directly, or send a new request from their booking site."
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <ManageReservation token={token} view={view} />
    </Shell>
  );
}
