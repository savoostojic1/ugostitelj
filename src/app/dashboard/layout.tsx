import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardSyncBar } from "@/components/dashboard/dashboard-sync-bar";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AutoSync } from "@/components/sync/auto-sync";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <DashboardSyncBar />
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
      <AutoSync />
      <InstallPrompt />
    </div>
  );
}
