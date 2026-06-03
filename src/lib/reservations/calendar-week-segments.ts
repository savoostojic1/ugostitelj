import { addDays } from "date-fns";
import {
  isSameCalendarDay,
  isStayNight,
  parseDateOnly,
} from "@/lib/dates/calendar-date";
import type { Reservation } from "@/types/database";

export interface CalendarWeekSegment {
  reservation: Reservation;
  startCol: number;
  stayEndCol: number;
  lane: number;
}

function assignLanes(
  segments: Omit<CalendarWeekSegment, "lane">[]
): CalendarWeekSegment[] {
  const lanes: CalendarWeekSegment[] = [];
  const laneEnds: number[] = [];

  for (const seg of segments) {
    let lane = 0;
    while (laneEnds[lane] !== undefined && laneEnds[lane] >= seg.startCol) {
      lane++;
    }
    laneEnds[lane] = seg.stayEndCol;
    lanes.push({ ...seg, lane });
  }
  return lanes;
}

export function getCalendarWeekSegments(
  weekDays: Date[],
  reservations: Reservation[]
): CalendarWeekSegment[] {
  const raw: Omit<CalendarWeekSegment, "lane">[] = [];

  for (const reservation of reservations) {
    const checkIn = parseDateOnly(reservation.check_in);
    const checkOut = parseDateOnly(reservation.check_out);
    const lastNight = addDays(checkOut, -1);

    const touchesWeek = weekDays.some((day) =>
      isStayNight(reservation.check_in, reservation.check_out, day)
    );
    if (!touchesWeek) continue;

    let startCol = weekDays.findIndex((day) => isSameCalendarDay(day, checkIn));
    if (startCol < 0) {
      startCol = weekDays.findIndex((day) =>
        isStayNight(reservation.check_in, reservation.check_out, day)
      );
      if (startCol < 0) startCol = 0;
    }

    let stayEndCol = weekDays.findIndex((day) =>
      isSameCalendarDay(day, lastNight)
    );
    if (stayEndCol < 0) {
      for (let i = weekDays.length - 1; i >= 0; i--) {
        if (isStayNight(reservation.check_in, reservation.check_out, weekDays[i])) {
          stayEndCol = i;
          break;
        }
      }
      if (stayEndCol < 0) stayEndCol = startCol;
    }

    raw.push({
      reservation,
      startCol,
      stayEndCol: Math.max(stayEndCol, startCol),
    });
  }

  return assignLanes(
    raw.sort(
      (a, b) =>
        parseDateOnly(a.reservation.check_in).getTime() -
        parseDateOnly(b.reservation.check_in).getTime()
    )
  );
}
