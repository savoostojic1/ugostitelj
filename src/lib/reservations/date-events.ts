import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import type { CalendarPlatform, Reservation } from "@/types/database";

export type DayEventType = "check_in" | "check_out";

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
  check_in: 1,
};

export const DAY_EVENT_LABELS: Record<DayEventType, string> = {
  check_out: "Checkout",
  check_in: "Check in",
};

export function formatCleaningCount(count: number): string {
  if (count === 1) return "1 čišćenje";
  return `${count} čišćenja`;
}

function countCheckouts(events: DayEvent[]): number {
  return events.filter((event) => event.type === "check_out").length;
}

type ReservationWithProperty = Reservation & {
  properties?: { name: string } | null;
};

function sortPropertyCards(cards: PropertyDayCard[]): PropertyDayCard[] {
  return [...cards].sort((a, b) =>
    a.propertyName.localeCompare(b.propertyName, "sr")
  );
}

function groupEventsByProperty(events: DayEvent[]): PropertyDayCard[] {
  const byProperty = new Map<string, PropertyDayCard>();

  for (const event of events) {
    const existing = byProperty.get(event.propertyId);
    if (!existing) {
      byProperty.set(event.propertyId, {
        propertyId: event.propertyId,
        propertyName: event.propertyName,
        types: [event.type],
      });
      continue;
    }
    if (!existing.types.includes(event.type)) {
      existing.types.push(event.type);
    }
  }

  for (const card of byProperty.values()) {
    card.types.sort((a, b) => EVENT_TYPE_ORDER[a] - EVENT_TYPE_ORDER[b]);
  }

  return sortPropertyCards(Array.from(byProperty.values()));
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
  reservations: ReservationWithProperty[],
  month: Date
): DayEventGroup[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const byDate = new Map<string, DayEvent[]>(
    days.map((day) => [format(day, "yyyy-MM-dd"), []])
  );

  for (const reservation of reservations) {
    const propertyName = reservation.properties?.name ?? "Nekretnina";
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
      properties: groupEventsByProperty(events),
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
    const propertyName = reservation.properties?.name ?? "Nekretnina";

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
        properties: groupEventsByProperty(events),
      };
    });
}
