"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, CalendarDays, Globe, Home, Plus } from "lucide-react";
import { GettingStartedChecklist } from "@/components/dashboard/getting-started-checklist";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PropertyExcessNotice } from "@/components/billing/property-excess-notice";
import { PropertyLimitNotice } from "@/components/billing/property-limit-notice";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { useAllowedProperties, useAllowedReservations } from "@/hooks/use-allowed-properties";
import { useBillingStatus, useInvalidateBillingStatus } from "@/hooks/use-billing";
import { LockedPropertiesSection } from "@/components/properties/locked-properties-section";
import { getPropertyCalendarColor } from "@/lib/properties/property-colors";
import { toast } from "sonner";

export default function PropertiesPageClient() {
  const {
    data: properties = [],
    lockedProperties = [],
    isLoading,
  } = useAllowedProperties();
  const { data: reservations = [] } = useAllowedReservations();
  const { data: billing } = useBillingStatus();
  const invalidateBilling = useInvalidateBillingStatus();
  const searchParams = useSearchParams();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const toastShown = useRef<string | null>(null);

  useEffect(() => {
    const upgrade = searchParams.get("upgrade");
    if (!upgrade || toastShown.current === upgrade) return;
    toastShown.current = upgrade;

    if (upgrade === "1") {
      setUpgradeOpen(true);
    }
    if (upgrade === "success") {
      toast.success("Welcome to Pro — unlimited properties unlocked");
      invalidateBilling();
    }
    if (upgrade === "canceled") {
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
            billing?.canAddProperty !== false ? (
              <Link
                href="/dashboard/properties/new"
                className="hostvia-btn-gradient inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add accommodation
              </Link>
            ) : null
          }
        />

        <GettingStartedChecklist variant="compact" />

        {billing ? (
          <>
            <PropertyExcessNotice
              propertyCount={billing.propertyCount}
              lockedPropertyCount={billing.lockedPropertyCount ?? 0}
              isOwner={billing.isOwner}
            />
            <PropertyLimitNotice
              propertyCount={billing.propertyCount}
              isPro={billing.isPro}
              isOwner={billing.isOwner}
              billingHref="/dashboard/billing"
            />
          </>
        ) : null}

        {!isLoading && properties.length === 0 && (
          <div className="hostvia-dashboard-page-inset mx-auto max-w-lg">
            <div className="hostvia-panel overflow-hidden p-6 text-center sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15">
                <Home className="h-7 w-7 text-violet-400" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white">
                No accommodations yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
                Add your first unit in under a minute — name it, connect
                calendar, publish on your site.
              </p>

              <ol className="mt-8 space-y-3 text-left">
                {[
                  {
                    icon: Building2,
                    title: "Name your unit",
                    description: "Apartment, room, studio…",
                  },
                  {
                    icon: CalendarDays,
                    title: "Sync calendar",
                    description: "Airbnb or Booking iCal link",
                  },
                  {
                    icon: Globe,
                    title: "Publish",
                    description: "Show on your booking site",
                  },
                ].map((step, index) => (
                  <li
                    key={step.title}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-semibold text-violet-300">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200">
                        {step.title}
                      </p>
                      <p className="text-xs text-zinc-500">{step.description}</p>
                    </div>
                    <step.icon className="h-4 w-4 shrink-0 text-zinc-600" />
                  </li>
                ))}
              </ol>

              <Link
                href="/dashboard/properties/new"
                className="hostvia-btn-gradient mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold sm:w-auto sm:min-w-[220px]"
              >
                <Plus className="h-4 w-4" />
                Add accommodation
              </Link>
            </div>
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

        <LockedPropertiesSection properties={lockedProperties} />
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
