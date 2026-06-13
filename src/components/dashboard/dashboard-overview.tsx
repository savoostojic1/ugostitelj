"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { appLocale } from "@/lib/dates/locale";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Globe,
  Home,
  Plus,
  TrendingUp,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PushNotificationsPrompt } from "@/components/pwa/push-notifications-prompt";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { useAllowedProperties, useAllowedReservations } from "@/hooks/use-allowed-properties";
import {
  getDashboardStats,
  groupArrivalsDepartures,
} from "@/lib/dashboard-stats";
import { formatReservationLabel } from "@/lib/reservations/display";
import { getPropertyCalendarColor } from "@/lib/properties/property-colors";

function ReservationListItem({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle: string;
  meta?: string;
}) {
  return (
    <li className="hostvia-list-item flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        <p className="truncate text-xs text-zinc-500">{subtitle}</p>
      </div>
      {meta ? (
        <span className="shrink-0 text-xs tabular-nums text-zinc-500">
          {meta}
        </span>
      ) : null}
    </li>
  );
}

export function DashboardOverview() {
  const { data: properties = [], isLoading: propsLoading } =
    useAllowedProperties();
  const { data: reservations = [], isLoading: resLoading } =
    useAllowedReservations();

  const isLoading = propsLoading || resLoading;
  const stats = getDashboardStats(properties, reservations);
  const arrivals = groupArrivalsDepartures(reservations);

  const weekReservations = reservations.filter((r) => {
    const checkIn = parseISO(r.check_in);
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return checkIn >= now && checkIn <= weekEnd;
  }).length;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Operations"
        title="Dashboard"
        description={`${stats.weekLabel} · ${properties.length} propert${properties.length === 1 ? "y" : "ies"}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="hostvia-dashboard-btn border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              asChild
            >
              <Link href="/dashboard/public-site">
                <Globe className="h-4 w-4" />
                Booking site
              </Link>
            </Button>
            <Link
              href="/dashboard/properties/new"
              className="hostvia-btn-gradient inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add property
            </Link>
          </>
        }
      />

      {!isLoading ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="hostvia-hero-metric">
              <div className="hostvia-hero-metric-glow" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-violet-300">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-widest">
                      Occupancy
                    </span>
                  </div>
                  <p className="mt-3 text-5xl font-bold tracking-tight text-white tabular-nums">
                    {stats.occupancyRate}%
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-zinc-400">
                    Portfolio occupancy across the next 28 days. Keep calendars
                    synced for accurate availability.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                  <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                      {arrivals.arrivalsToday.length}
                    </p>
                    <p className="text-xs text-zinc-500">Arrivals today</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-2xl font-bold text-rose-400 tabular-nums">
                      {arrivals.departuresToday.length}
                    </p>
                    <p className="text-xs text-zinc-500">Departures today</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <DashboardStatCard
                label="Reservations this week"
                value={weekReservations}
                icon={CalendarDays}
                accent="cyan"
              />
              <DashboardStatCard
                label="Active properties"
                value={properties.length}
                icon={BarChart3}
                accent="violet"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardPanel
              title="Arrivals today"
              icon={<ArrowDownLeft className="h-4 w-4" />}
            >
              {arrivals.arrivalsToday.length === 0 ? (
                <p className="text-sm text-zinc-500">No arrivals scheduled</p>
              ) : (
                <ul className="space-y-2">
                  {arrivals.arrivalsToday.map((r) => (
                    <ReservationListItem
                      key={r.id}
                      title={formatReservationLabel(r.title, r.platform)}
                      subtitle={r.propertyName}
                    />
                  ))}
                </ul>
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Departures today"
              icon={<ArrowUpRight className="h-4 w-4" />}
            >
              {arrivals.departuresToday.length === 0 ? (
                <p className="text-sm text-zinc-500">No departures scheduled</p>
              ) : (
                <ul className="space-y-2">
                  {arrivals.departuresToday.map((r) => (
                    <ReservationListItem
                      key={r.id}
                      title={formatReservationLabel(r.title, r.platform)}
                      subtitle={r.propertyName}
                    />
                  ))}
                </ul>
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Upcoming arrivals"
              icon={<CalendarDays className="h-4 w-4" />}
              action={
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href="/dashboard/arrivals">View all</Link>
                </Button>
              }
            >
              {stats.upcomingArrivals.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing upcoming</p>
              ) : (
                <ul className="space-y-2">
                  {stats.upcomingArrivals.slice(0, 5).map((r) => {
                    const prop = properties.find((p) => p.id === r.property_id);
                    return (
                      <ReservationListItem
                        key={r.id}
                        title={formatReservationLabel(r.title, r.platform)}
                        subtitle={prop?.name ?? "Property"}
                        meta={format(parseISO(r.check_in), "MMM d", {
                          locale: appLocale,
                        })}
                      />
                    );
                  })}
                </ul>
              )}
            </DashboardPanel>
          </div>

          {properties.length > 0 && (
            <DashboardPanel
              title="Properties"
              description="Quick access to your listings"
              icon={<Home className="h-4 w-4" />}
              action={
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href="/dashboard/properties">
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {properties.slice(0, 6).map((p, i) => {
                  const colors = getPropertyCalendarColor(i);
                  const count = reservations.filter(
                    (r) => r.property_id === p.id
                  ).length;
                  return (
                    <Link
                      key={p.id}
                      href={`/dashboard/properties/${p.id}`}
                      className="hostvia-list-item group block"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: colors.solid }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white group-hover:text-violet-200">
                            {p.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {count} booking{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-violet-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </DashboardPanel>
          )}
        </>
      ) : null}

      <PushNotificationsPrompt hideWhenSubscribed />
    </div>
  );
}
