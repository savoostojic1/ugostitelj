import { Plus_Jakarta_Sans } from "next/font/google";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardLoadingGate } from "@/components/dashboard/dashboard-loading-gate";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AutoSync } from "@/components/sync/auto-sync";

const dashboardSans = Plus_Jakarta_Sans({
  variable: "--font-marketing-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`dark hostvia-app hostvia-dashboard-bg flex min-h-screen flex-col md:flex-row ${dashboardSans.variable}`}
    >
      <AppSidebar />
      <div className="hostvia-dashboard-main flex min-h-screen min-w-0 flex-1 flex-col text-foreground">
        <DashboardTopbar />
        <div className="hostvia-dashboard-content">
          <DashboardLoadingGate>{children}</DashboardLoadingGate>
        </div>
      </div>
      <AutoSync />
      <InstallPrompt />
    </div>
  );
}
