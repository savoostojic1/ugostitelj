"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Home, Plus } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PropertyLimitNotice } from "@/components/billing/property-limit-notice";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { useBillingStatus, useInvalidateBillingStatus } from "@/hooks/use-billing";
import { useProperties, useReservations } from "@/hooks/use-properties";
import { getPropertyCalendarColor } from "@/lib/properties/property-colors";
import { toast } from "sonner";

export default function PropertiesPageClient() {
  const { data: properties = [], isLoading } = useProperties();
  const { data: reservations = [] } = useReservations();
  const { data: billing } = useBillingStatus();
  const invalidateBilling = useInvalidateBillingStatus();
  const searchParams = useSearchParams();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgrade") === "1") {
      setUpgradeOpen(true);
    }
    if (searchParams.get("upgrade") === "success") {
      toast.success("Welcome to Pro — unlimited properties unlocked");
      invalidateBilling();
    }
    if (searchParams.get("upgrade") === "canceled") {
      toast.message("Upgrade canceled");
    }
  }, [searchParams, invalidateBilling]);

  return (
    <>
      <div className="space-y-8">
        <DashboardPageHeader
          eyebrow="Portfolio"
          title="Properties"
          description="Manage listings, calendars and booking settings"
          actions={
            <Link
              href="/dashboard/properties/new"
              className="hostvia-btn-gradient inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add property
            </Link>
          }
        />

        {billing ? (
          <PropertyLimitNotice
            propertyCount={billing.propertyCount}
            isPro={billing.isPro}
            isOwner={billing.isOwner}
          />
        ) : null}

        {!isLoading && properties.length === 0 && (
          <div className="hostvia-panel flex flex-col items-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15">
              <Home className="h-7 w-7 text-violet-400" />
            </div>
            <p className="mt-5 max-w-sm text-zinc-400">
              No properties yet. Add your first listing to connect calendars and
              publish your booking site.
            </p>
            <Link
              href="/dashboard/properties/new"
              className="hostvia-btn-gradient mt-6 inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold"
            >
              Add property
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p, i) => {
            const colors = getPropertyCalendarColor(i);
            const count = reservations.filter(
              (r) => r.property_id === p.id
            ).length;
            return (
              <Link
                key={p.id}
                href={`/dashboard/properties/${p.id}`}
                className="hostvia-panel group block p-5 transition hover:border-violet-500/25"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ring-white/5"
                    style={{ background: `${colors.solid}18` }}
                  >
                    <Home className="h-5 w-5" style={{ color: colors.solid }} />
                  </div>
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-500">
                    {count} bookings
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-violet-200">
                  {p.name}
                </h3>
                <p className="mt-2 flex items-center gap-1 text-sm text-zinc-500 group-hover:text-zinc-400">
                  Open settings
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
