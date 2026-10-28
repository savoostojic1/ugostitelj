"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ConditionalDashboardTopbar } from "@/components/dashboard/conditional-dashboard-topbar";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import CalendarsOverviewPage from "@/app/dashboard/calendars/page";
import ArrivalsPage from "@/app/dashboard/arrivals/page";
import CleaningsPage from "@/app/dashboard/cleanings/page";
import { useUiStore } from "@/stores/ui-store";
import type { Property, Reservation } from "@/types/database";

const billingStatus = {
  isOwner: true,
  propertyCount: 5,
  freeLimit: 2,
  isPro: true,
  subscriptionStatus: "active",
  currentPeriodEnd: null,
  canAddProperty: true,
  requiresUpgrade: false,
};

const FIXED_NOW = new Date(2026, 9, 21, 10, 0, 0).getTime();
if (typeof window !== "undefined" && !(globalThis as { __fakeDate?: boolean }).__fakeDate) {
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(FIXED_NOW);
      else super(...(args as [string]));
    }
    static now() {
      return FIXED_NOW;
    }
  }
  (globalThis as { Date: DateConstructor }).Date = FakeDate as DateConstructor;
  (globalThis as { __fakeDate?: boolean }).__fakeDate = true;

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes("/api/")) {
      const body = url.includes("/api/billing/status") ? billingStatus : {};
      return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
    }
    return realFetch(input, init);
  };
}

const HOST_ID = "sample-host";
const stamp = "2026-01-01T00:00:00.000Z";

const properties: Property[] = [1, 2, 3, 4, 5].map((n) => ({
  id: `p${n}`,
  user_id: HOST_ID,
  name: `Bungalow ${n}`,
  address: null,
  image_url: null,
  is_public: true,
  created_at: stamp,
  updated_at: stamp,
}));

type Row = [string, number, string, string, Reservation["platform"], string?];
const rows: Row[] = [
  ["r1", 1, "2026-10-17", "2026-10-21", "airbnb"],
  ["r2", 1, "2026-10-21", "2026-10-25", "custom", "Laura Bennett"],
  ["r3", 1, "2026-10-27", "2026-10-31", "booking"],
  ["r4", 2, "2026-10-19", "2026-10-23", "booking"],
  ["r5", 2, "2026-10-23", "2026-10-26", "airbnb"],
  ["r6", 2, "2026-10-29", "2026-11-02", "custom", "Marko Petrović"],
  ["r7", 3, "2026-10-21", "2026-10-23", "airbnb"],
  ["r8", 3, "2026-10-24", "2026-10-28", "custom", "Anna Schmidt"],
  ["r9", 4, "2026-10-19", "2026-10-22", "custom", "Jovana Ilić"],
  ["r10", 4, "2026-10-22", "2026-10-27", "booking"],
  ["r11", 5, "2026-10-16", "2026-10-24", "airbnb"],
  ["r12", 5, "2026-10-25", "2026-10-30", "booking"],
];

const reservations = rows.map(([id, n, checkIn, checkOut, platform, guest]) => ({
  id,
  property_id: `p${n}`,
  user_id: HOST_ID,
  calendar_feed_id: guest ? null : `f${n}${platform}`,
  external_uid: id,
  title: guest ?? (platform === "booking" ? "CLOSED - Not available" : "Reserved"),
  check_in: checkIn,
  check_out: checkOut,
  platform,
  is_manual: Boolean(guest),
  source: guest ? "Phone" : null,
  created_at: stamp,
  updated_at: stamp,
  properties: { name: `Bungalow ${n}` },
}));

function seededClient() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false },
    },
  });
  qc.setQueryData(["properties"], properties);
  qc.setQueryData(["reservations"], reservations);
  qc.setQueryData(["billing-status"], billingStatus);
  qc.setQueryData(["dashboard-context"], {
    user: { id: HOST_ID, email: "host@example.com" },
    isOwner: true,
    hostId: HOST_ID,
    permissions: [],
    teamAccess: null,
  });
  qc.setQueryData(["host-profile"], {
    id: HOST_ID,
    username: "sample",
    business_name: "Sample stays",
    description: "Five bungalows",
    is_published: true,
    social_links: {},
  });
  qc.setQueryData(["setup-feed-count", properties.map((p) => p.id)], 5);
  qc.setQueryData(["saved-messages"], []);
  qc.setQueryData(["booking-requests"], []);
  return qc;
}

const SCREENS: Record<string, React.ComponentType> = {
  dashboard: DashboardOverview,
  calendars: CalendarsOverviewPage,
  arrivals: ArrivalsPage,
  cleanings: CleaningsPage,
};

export default function VideoPreviewPage() {
  const { screen } = useParams<{ screen: string }>();
  const [client] = useState(seededClient);
  const [ready, setReady] = useState(false);
  const Screen = SCREENS[screen] ?? DashboardOverview;

  useEffect(() => {
    useUiStore.getState().setCalendarMonth(new Date(2026, 9, 1));
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={client}>
      <div className="dark hostvia-app hostvia-dashboard-bg flex min-h-screen flex-col md:flex-row">
        <AppSidebar />
        <div className="hostvia-dashboard-main flex min-h-screen min-w-0 flex-1 flex-col text-foreground">
          <ConditionalDashboardTopbar />
          <div className="hostvia-dashboard-shell">
            <div className="hostvia-dashboard-content">
              <div className="hostvia-dashboard-page">
                <Screen />
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
