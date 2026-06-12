import { DashboardLoader } from "@/components/dashboard/dashboard-loader";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="rounded-2xl border border-white/8 bg-[#0a0a10]/80 px-8 py-7 shadow-2xl backdrop-blur-md">
        <DashboardLoader />
      </div>
    </div>
  );
}
