import assert from "node:assert/strict";
import test from "node:test";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import { isNightOccupied } from "@/lib/reservations/availability";
import type { Reservation } from "@/types/database";

function stay(id: string, checkIn: string, checkOut: string): Reservation {
  return {
    id,
    property_id: "property-1",
    calendar_feed_id: null,
    external_uid: `manual-${id}`,
    title: "Ada Guest",
    check_in: checkIn,
    check_out: checkOut,
    platform: "custom",
    is_manual: true,
    created_at: "2026-11-01T00:00:00.000Z",
    updated_at: "2026-11-01T00:00:00.000Z",
  };
}

test("a cancelled reservation no longer blocks the availability calendar", () => {
  const confirmed = stay("stay-a", "2026-12-01", "2026-12-05");
  const other = stay("stay-b", "2026-12-10", "2026-12-12");
  const night = parseDateOnly("2026-12-02");
  const later = parseDateOnly("2026-12-10");

  assert.equal(isNightOccupied([confirmed, other], night), true);
  const afterCancellation = [other];
  assert.equal(isNightOccupied(afterCancellation, night), false);
  assert.equal(isNightOccupied(afterCancellation, later), true);
});
