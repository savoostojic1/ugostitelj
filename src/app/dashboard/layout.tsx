import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardLoadingGate } from "@/components/dashboard/dashboard-loading-gate";
import { ConditionalDashboardTopbar } from "@/components/dashboard/conditional-dashboard-topbar";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AutoSync } from "@/components/sync/auto-sync";
import { TeamAccessGuard } from "@/components/team-access/team-access-guard";
import { getImpersonationMarker } from "@/lib/admin/impersonation";
import { getAdminSession } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata(
  "Dashboard",
  "Private Hostvia dashboard for the signed-in account."
);

const dashboardSans = Plus_Jakarta_Sans({
  variable: "--font-marketing-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const marker = await getImpersonationMarker();
  const isAdmin = marker ? await getAdminSession() : false;
  let showImpersonationBanner = false;
  if (marker && isAdmin) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    showImpersonationBanner = user?.id === marker.hostId;
  }

  return (
    <div
      className={`dark hostvia-app hostvia-dashboard-bg flex min-h-screen flex-col md:flex-row ${dashboardSans.variable}`}
    >
      <AppSidebar />
      <div className="hostvia-dashboard-main flex min-h-screen min-w-0 flex-1 flex-col text-foreground">
        {showImpersonationBanner && marker ? (
          <ImpersonationBanner
            email={marker.email}
            username={marker.username}
          />
        ) : null}
        <ConditionalDashboardTopbar />
        <div className="hostvia-dashboard-shell">
          <div className="hostvia-dashboard-content">
            <DashboardLoadingGate>
              <TeamAccessGuard>
                <div className="hostvia-dashboard-page">{children}</div>
              </TeamAccessGuard>
            </DashboardLoadingGate>
          </div>
        </div>
      </div>
      <AutoSync />
      <InstallPrompt />
    </div>
  );
}
