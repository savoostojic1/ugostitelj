import type { PublicHostProfile } from "@/lib/public/types";
import { HostPublicFooter } from "@/components/public/host-public-footer";
import { HostPublicMap } from "@/components/public/host-public-map";

export function PublicShell({
  children,
  host,
}: {
  children: React.ReactNode;
  host?: PublicHostProfile;
}) {
  return (
    <div className="public-site public-page-bg min-h-screen text-[var(--public-fg)] selection:bg-[var(--public-accent-soft)] selection:text-[var(--public-accent)]">
      <main>{children}</main>
      {host ? <HostPublicMap host={host} /> : null}
      {host ? <HostPublicFooter host={host} /> : null}
    </div>
  );
}
