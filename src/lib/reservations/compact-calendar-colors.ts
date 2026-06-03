import { formatReservationLabel } from "@/lib/reservations/display";
import type { Reservation } from "@/types/database";

/** Jasno različite boje — svaka rezervacija dobija sljedeću u nizu. */
export const COMPACT_RESERVATION_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#0891b2",
  "#ca8a04",
  "#db2777",
  "#4f46e5",
  "#0d9488",
  "#b45309",
  "#7c3aed",
] as const;

export function filterVisibleCompactReservations(
  reservations: Reservation[]
): Reservation[] {
  return reservations.filter(
    (r) => formatReservationLabel(r.title, r.platform) !== "Blokirano"
  );
}

export function buildReservationColorMap(
  reservations: Reservation[]
): Map<string, string> {
  const visible = filterVisibleCompactReservations(reservations);
  const sorted = [...visible].sort(
    (a, b) =>
      a.check_in.localeCompare(b.check_in) || a.id.localeCompare(b.id)
  );

  const map = new Map<string, string>();
  sorted.forEach((reservation, index) => {
    map.set(
      reservation.id,
      COMPACT_RESERVATION_COLORS[index % COMPACT_RESERVATION_COLORS.length]
    );
  });
  return map;
}

export function getReservationColor(
  colorMap: Map<string, string>,
  reservationId: string
): string {
  return colorMap.get(reservationId) ?? COMPACT_RESERVATION_COLORS[0];
}
