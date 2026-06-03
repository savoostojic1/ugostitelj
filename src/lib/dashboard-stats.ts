import {
  addDays,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { Property, Reservation } from "@/types/database";

export function getDashboardStats(
  properties: Property[],
  reservations: Reservation[]
) {
  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const arrivals = reservations.filter((r) => {
    const checkIn = parseISO(r.check_in);
    return checkIn >= today && checkIn <= addDays(today, 30);
  });

  const departures = reservations.filter((r) => {
    const checkOut = parseISO(r.check_out);
    return checkOut >= today && checkOut <= addDays(today, 30);
  });

  const upcomingArrivals = arrivals
    .sort((a, b) => a.check_in.localeCompare(b.check_in))
    .slice(0, 5);

  const upcomingDepartures = departures
    .sort((a, b) => a.check_out.localeCompare(b.check_out))
    .slice(0, 5);

  const monthStart = startOfWeek(today, { weekStartsOn: 1 });
  const daysInView = 28;
  let occupiedNights = 0;
  for (let i = 0; i < daysInView; i++) {
    const day = addDays(monthStart, i);
    const hasBooking = reservations.some((r) => {
      const checkIn = parseISO(r.check_in);
      const checkOut = parseISO(r.check_out);
      return isWithinInterval(day, { start: checkIn, end: addDays(checkOut, -1) });
    });
    if (hasBooking) occupiedNights++;
  }

  const occupancyRate = Math.round((occupiedNights / daysInView) * 100);

  return {
    totalProperties: properties.length,
    upcomingArrivals,
    upcomingDepartures,
    occupancyRate,
    weekLabel: `${format(today, "MMM d")} – ${format(weekEnd, "MMM d")}`,
  };
}

export function groupArrivalsDepartures(
  reservations: (Reservation & { properties?: { name: string } | null })[]
) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const withProperty = (r: (typeof reservations)[0]) => ({
    ...r,
    propertyName: r.properties?.name ?? "Property",
  });

  const arrivalsToday = reservations
    .filter((r) => parseISO(r.check_in).getTime() === today.getTime())
    .map(withProperty);

  const arrivalsTomorrow = reservations
    .filter((r) => parseISO(r.check_in).getTime() === tomorrow.getTime())
    .map(withProperty);

  const arrivalsThisWeek = reservations
    .filter((r) => {
      const d = parseISO(r.check_in);
      return d > tomorrow && d <= weekEnd;
    })
    .map(withProperty);

  const departuresToday = reservations
    .filter((r) => parseISO(r.check_out).getTime() === today.getTime())
    .map(withProperty);

  const departuresTomorrow = reservations
    .filter((r) => parseISO(r.check_out).getTime() === tomorrow.getTime())
    .map(withProperty);

  const departuresThisWeek = reservations
    .filter((r) => {
      const d = parseISO(r.check_out);
      return d > tomorrow && d <= weekEnd;
    })
    .map(withProperty);

  return {
    arrivalsToday,
    arrivalsTomorrow,
    arrivalsThisWeek,
    departuresToday,
    departuresTomorrow,
    departuresThisWeek,
  };
}
