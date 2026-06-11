import { DateEventsList } from "@/components/dashboard/date-events-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";

export default function CleaningsPage() {
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Operations"
        title="Cleanings"
        description="Reservations, check-ins, check-outs and cleaning count by day"
      />

      <DashboardPanel
        title="Monthly calendar"
        description="Reservations, check-ins and availability by day"
        noPadding
        contentClassName="p-0"
      >
        <div className="p-1 sm:p-2">
          <DateEventsList embedded />
        </div>
      </DashboardPanel>
    </div>
  );
}
