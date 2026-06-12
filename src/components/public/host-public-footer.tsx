import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FormattedMultilineText } from "@/components/public/formatted-multiline-text";
import type { PublicHostProfile } from "@/lib/public/types";

interface HostPublicFooterProps {
  host: PublicHostProfile;
}

export function HostPublicFooter({ host }: HostPublicFooterProps) {
  const instagram = host.social_links?.instagram;
  const facebook = host.social_links?.facebook;

  return (
    <footer className="public-section--footer">
      <div className="public-section-inner public-section--footer-inner">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <div className="flex items-center gap-3">
              {host.logo_url ? (
                <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-[var(--public-border)] bg-white shadow-sm">
                  <Image
                    src={host.logo_url}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="44px"
                    unoptimized
                  />
                </div>
              ) : null}
              <div>
                <p className="text-lg font-semibold tracking-tight">
                  {host.business_name}
                </p>
                {host.location ? (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--public-muted)]">
                    <MapPin className="h-3.5 w-3.5" />
                    {host.location}
                  </p>
                ) : null}
              </div>
            </div>
            {host.footer_description ? (
              <FormattedMultilineText className="mt-5 max-w-lg text-sm leading-relaxed text-[var(--public-muted)]">
                {host.footer_description}
              </FormattedMultilineText>
            ) : null}
          </div>

          <div className="space-y-4">
            <p className="public-label">Contact</p>
            <ul className="space-y-3 text-sm">
              {host.contact_phone ? (
                <li>
                  <a
                    href={`tel:${host.contact_phone}`}
                    className="inline-flex items-center gap-2.5 font-medium text-[var(--public-fg)] transition hover:text-[var(--public-accent)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--public-accent-soft)] text-[var(--public-accent)]">
                      <Phone className="h-4 w-4" />
                    </span>
                    {host.contact_phone}
                  </a>
                </li>
              ) : null}
              {host.contact_email ? (
                <li>
                  <a
                    href={`mailto:${host.contact_email}`}
                    className="inline-flex items-center gap-2.5 font-medium text-[var(--public-fg)] transition hover:text-[var(--public-accent)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--public-accent-soft)] text-[var(--public-accent)]">
                      <Mail className="h-4 w-4" />
                    </span>
                    {host.contact_email}
                  </a>
                </li>
              ) : null}
            </ul>

            {instagram || facebook ? (
              <div className="flex flex-wrap gap-3 pt-2">
                {instagram ? (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-btn public-btn-secondary px-4 py-2.5 text-xs"
                  >
                    Instagram
                  </a>
                ) : null}
                {facebook ? (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-btn public-btn-secondary px-4 py-2.5 text-xs"
                  >
                    Facebook
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--public-border)] pt-8 text-center text-xs text-[var(--public-muted)] md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} {host.business_name}</p>
          <p>
            Powered by{" "}
            <Link
              href="/"
              className="font-semibold text-[var(--public-fg)] underline-offset-4 hover:underline"
            >
              Hostvia
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
