export function formatSyncResultMessage(result: {
  imported?: number;
  removed?: number;
  totalEvents?: number;
  skippedBlocked?: number;
  error?: string;
}): string {
  if (result.error) return result.error;

  const imported = result.imported ?? 0;
  const removed = result.removed ?? 0;
  const total = result.totalEvents ?? 0;
  const blocked = result.skippedBlocked ?? 0;

  if (total === 0 && removed === 0) {
    return "Kalendar je prazan ili link nije ispravan Export URL. Booking: Sync calendars → Export (ne Import).";
  }

  if (imported === 0 && blocked > 0 && removed === 0) {
    return `U kalendaru je ${total} događaja, ali su svi označeni kao blokade (Airbnb stil). Za Booking probaj ponovo Sync — Booking često koristi „CLOSED“ i za prave rezervacije.`;
  }

  if (imported === 0 && removed === 0) {
    return `Pronađeno ${total} događaja, ali nijedan nije prepoznat kao rezervacija. Provjeri Export link.`;
  }

  const extra =
    blocked > 0 ? ` (${blocked} blokada preskočeno)` : total > imported ? ` (od ${total} u kalendaru)` : "";

  const removedText =
    removed > 0
      ? `, uklonjeno ${removed} otkazan${removed === 1 ? "a" : "ih"}`
      : "";

  if (imported === 0 && removed > 0) {
    return `Uklonjeno ${removed} otkazan${removed === 1 ? "a" : "ih"} rezervacija koje više nisu u kalendaru.`;
  }

  return `Uvezeno ${imported} rezervacija${extra}${removedText}.`;
}
