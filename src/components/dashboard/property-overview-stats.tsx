"use client";

import { useMemo } from "react";
import {
  addDays,
  differenceInDays,
  endOfMonth,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { BarChart3, Calendar, Users } from "lucide-react";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import {
  formatReservationLabel,
  getReservationOriginCode,
  getReservationOriginLabel,
} from "@/lib/reservations/display";
import type { Reservation } from "@/types/database";

export function PropertyOverviewStats({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;

    let occupiedNights = 0;
    for (let i = 0; i < daysInMonth; i++) {
      const day = addDays(monthStart, i);
      const hasBooking = reservations.some((r) => {
        const checkIn = parseISO(r.check_in);
        const checkOut = parseISO(r.check_out);
        return isWithinInterval(day, {
          start: checkIn,
          end: addDays(checkOut, -1),
        });
      });
      if (hasBooking) occupiedNights++;
    }

    const occupancy = Math.round((occupiedNights / daysInMonth) * 100);
    const recent = [...reservations]
      .sort((a, b) => b.check_in.localeCompare(a.check_in))
      .slice(0, 5);

    const sources = {
      airbnb: reservations.filter(
        (r) => getReservationOriginCode(r) === "airbnb"
      ).length,
      booking: reservations.filter(
        (r) => getReservationOriginCode(r) === "booking"
      ).length,
      direct: reservations.filter(
        (r) => getReservationOriginCode(r) === "direct"
      ).length,
    };

    return { occupancy, recent, total: reservations.length, sources };
  }, [reservations]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          label="Occupancy this month"
          value={`${stats.occupancy}%`}
          icon={BarChart3}
          accent="violet"
        />
        <DashboardStatCard
          label="Total reservations"
          value={stats.total}
          icon={Calendar}
          accent="cyan"
        />
        <DashboardStatCard
          label="Booking sources"
          value={`${stats.sources.direct} direct`}
          icon={Users}
          accent="emerald"
          trend={`${stats.sources.airbnb} Airbnb · ${stats.sources.booking} Booking`}
        />
      </div>

      {stats.recent.length > 0 && (
        <div className="hostvia-glow-card p-5">
          <h3 className="mb-4 font-semibold text-white">Recent reservations</h3>
          <div className="space-y-2">
            {stats.recent.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {formatReservationLabel(r.title, r.platform)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getReservationOriginLabel(r)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.check_in} → {r.check_out}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
