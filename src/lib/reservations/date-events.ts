import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { isStayNight, parseDateOnly } from "@/lib/dates/calendar-date";
import {
  getReservationOriginCode,
  type ReservationOriginCode,
} from "@/lib/reservations/display";
import type { CalendarPlatform, Reservation } from "@/types/database";

export type DayEventType = "check_in" | "check_out" | "stayover" | "empty";

export interface DayEvent {
  key: string;
  reservationId: string;
  propertyId: string;
  propertyName: string;
  type: DayEventType;
  platform: CalendarPlatform;
  title: string;
}

/** Jedan kvadrat po nekretnini — svi tipovi događaja tog dana. */
export interface PropertyDayCard {
  propertyId: string;
  propertyName: string;
  types: DayEventType[];
  /** Izvor dolaska — A / B / D */
  checkInOriginCode?: ReservationOriginCode | null;
}

export interface DayEventGroup {
  dateKey: string;
  date: Date;
  dayNumber: string;
  /** Broj checkoutova = broj čišćenja tog dana. */
  cleaningCount: number;
  properties: PropertyDayCard[];
}

const EVENT_TYPE_ORDER: Record<DayEventType, number> = {
  check_out: 0,
  empty: 1,
  check_in: 2,
  stayover: 3,
};

export const DAY_EVENT_LABELS: Record<DayEventType, string> = {
  check_out: "Checkout",
  check_in: "Check in",
  stayover: "Stayover",
  empty: "Empty",
};

export function formatCleaningCount(count: number): string {
  if (count === 1) return "1 cleaning";
  return `${count} cleanings`;
}

export function formatFreeDaysCount(count: number): string {
  if (count === 1) return "1 free day";
  return `${count} free days`;
}

export interface PropertyFreeDaysSummary {
  propertyId: string;
  propertyName: string;
  freeDays: number;
}

export interface MonthFreeDaysSummary {
  properties: PropertyFreeDaysSummary[];
  totalFreeDays: number;
  daysInRange: number;
}

function getMonthDayRange(
  month: Date,
  options?: { from?: Date }
): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const from = startOfDay(options?.from ?? monthStart);

  if (monthEnd < from) {
    return [];
  }

  const rangeStart = monthStart > from ? monthStart : from;
  return eachDayOfInterval({ start: rangeStart, end: monthEnd });
}

function isPropertyFreeOnDay(
  propertyId: string,
  day: Date,
  reservations: ReservationWithProperty[]
): boolean {
  return !reservations.some(
    (reservation) =>
      reservation.property_id === propertyId &&
      isStayNight(reservation.check_in, reservation.check_out, day)
  );
}

export function computeMonthFreeDaysSummary(
  properties: { id: string; name: string }[],
  reservations: ReservationWithProperty[],
  month: Date,
  options?: { from?: Date }
): MonthFreeDaysSummary {
  const days = getMonthDayRange(month, options);

  const propertySummaries = [...properties]
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((property) => {
      let freeDays = 0;
      for (const day of days) {
        if (isPropertyFreeOnDay(property.id, day, reservations)) {
          freeDays++;
        }
      }
      return {
        propertyId: property.id,
        propertyName: property.name,
        freeDays,
      };
    });

  return {
    properties: propertySummaries,
    totalFreeDays: propertySummaries.reduce(
      (sum, property) => sum + property.freeDays,
      0
    ),
    daysInRange: days.length,
  };
}

function countCheckouts(events: DayEvent[]): number {
  return events.filter((event) => event.type === "check_out").length;
}

type ReservationWithProperty = Reservation & {
  properties?: { name: string } | null;
};

function sortPropertyCards(cards: PropertyDayCard[]): PropertyDayCard[] {
  return [...cards].sort((a, b) =>
    a.propertyName.localeCompare(b.propertyName, "en")
  );
}

function getPropertyDayTypes(
  propertyId: string,
  day: Date,
  dateKey: string,
  reservations: ReservationWithProperty[]
): DayEventType[] {
  const propertyReservations = reservations.filter(
    (r) => r.property_id === propertyId
  );

  let hasCheckIn = false;
  let hasCheckOut = false;
  let hasStay = false;

  for (const reservation of propertyReservations) {
    const checkInKey = reservation.check_in.split("T")[0];
    const checkOutKey = reservation.check_out.split("T")[0];

    if (checkInKey === dateKey) hasCheckIn = true;
    if (checkOutKey === dateKey) hasCheckOut = true;
    if (isStayNight(reservation.check_in, reservation.check_out, day)) {
      hasStay = true;
    }
  }

  const types: DayEventType[] = [];
  if (hasCheckOut) types.push("check_out");
  if (hasCheckIn) types.push("check_in");
  if (types.length === 0 && hasStay) types.push("stayover");
  if (types.length === 0) {
    types.push("empty");
  } else if (hasCheckOut && !hasCheckIn && !hasStay) {
    types.push("empty");
  }

  return types;
}

function getCheckInOriginCode(
  propertyId: string,
  dateKey: string,
  reservations: ReservationWithProperty[]
): ReservationOriginCode | null {
  const checkingIn = reservations.find(
    (r) =>
      r.property_id === propertyId && r.check_in.split("T")[0] === dateKey
  );
  if (!checkingIn) return null;
  return getReservationOriginCode(checkingIn);
}

function buildPropertyDayCards(
  properties: { id: string; name: string }[],
  day: Date,
  dateKey: string,
  reservations: ReservationWithProperty[]
): PropertyDayCard[] {
  return sortPropertyCards(
    properties.map((property) => {
      const types = getPropertyDayTypes(
        property.id,
        day,
        dateKey,
        reservations
      );
      types.sort((a, b) => EVENT_TYPE_ORDER[a] - EVENT_TYPE_ORDER[b]);
      const hasCheckIn = types.includes("check_in");
      return {
        propertyId: property.id,
        propertyName: property.name,
        types,
        checkInOriginCode: hasCheckIn
          ? getCheckInOriginCode(property.id, dateKey, reservations)
          : null,
      };
    })
  );
}

function pushEvent(
  byDate: Map<string, DayEvent[]>,
  dateKey: string,
  event: DayEvent
) {
  const events = byDate.get(dateKey) ?? [];
  events.push(event);
  byDate.set(dateKey, events);
}

export function buildMonthDayGroups(
  properties: { id: string; name: string }[],
  reservations: ReservationWithProperty[],
  month: Date,
  options?: { from?: Date }
): DayEventGroup[] {
  const days = getMonthDayRange(month, options);
  if (days.length === 0) {
    return [];
  }

  const byDate = new Map<string, DayEvent[]>(
    days.map((day) => [format(day, "yyyy-MM-dd"), []])
  );

  for (const reservation of reservations) {
    const propertyName = reservation.properties?.name ?? "Property";
    const checkInKey = reservation.check_in.split("T")[0];
    const checkOutKey = reservation.check_out.split("T")[0];

    if (byDate.has(checkInKey)) {
      pushEvent(byDate, checkInKey, {
        key: `${reservation.id}-in`,
        reservationId: reservation.id,
        propertyId: reservation.property_id,
        propertyName,
        type: "check_in",
        platform: reservation.platform,
        title: reservation.title,
      });
    }

    if (byDate.has(checkOutKey)) {
      pushEvent(byDate, checkOutKey, {
        key: `${reservation.id}-out`,
        reservationId: reservation.id,
        propertyId: reservation.property_id,
        propertyName,
        type: "check_out",
        platform: reservation.platform,
        title: reservation.title,
      });
    }
  }

  return days.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const events = byDate.get(dateKey) ?? [];
    return {
      dateKey,
      date: day,
      dayNumber: format(day, "d"),
      cleaningCount: countCheckouts(events),
      properties: buildPropertyDayCards(properties, day, dateKey, reservations),
    };
  });
}

export function buildDateEventGroups(
  reservations: ReservationWithProperty[],
  options?: { from?: Date; days?: number }
): DayEventGroup[] {
  const from = startOfDay(options?.from ?? new Date());
  const days = options?.days ?? 60;
  const to = addDays(from, days);

  const byDate = new Map<string, DayEvent[]>();

  for (const reservation of reservations) {
    const propertyName = reservation.properties?.name ?? "Property";

    const checkIn = parseDateOnly(reservation.check_in);
    const checkOut = parseDateOnly(reservation.check_out);

    if (checkIn >= from && checkIn <= to) {
      const dateKey = reservation.check_in.split("T")[0];
      pushEvent(byDate, dateKey, {
        key: `${reservation.id}-in`,
        reservationId: reservation.id,
        propertyId: reservation.property_id,
        propertyName,
        type: "check_in",
        platform: reservation.platform,
        title: reservation.title,
      });
    }

    if (checkOut >= from && checkOut <= to) {
      const dateKey = reservation.check_out.split("T")[0];
      pushEvent(byDate, dateKey, {
        key: `${reservation.id}-out`,
        reservationId: reservation.id,
        propertyId: reservation.property_id,
        propertyName,
        type: "check_out",
        platform: reservation.platform,
        title: reservation.title,
      });
    }
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, events]) => {
      const date = parseDateOnly(dateKey);
      return {
        dateKey,
        date,
        dayNumber: format(date, "d"),
        cleaningCount: countCheckouts(events),
        properties: buildPropertyDayCards(
          Array.from(
            new Map(
              reservations.map((r) => [
                r.property_id,
                r.properties?.name ?? "Property",
              ])
            ),
            ([id, name]) => ({ id, name })
          ),
          date,
          dateKey,
          reservations
        ),
      };
    });
}
