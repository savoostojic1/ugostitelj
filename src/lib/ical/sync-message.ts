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
    return "Calendar is empty or the link is not a valid Export URL. Booking: Sync calendars → Export (not Import).";
  }

  if (imported === 0 && blocked > 0 && removed === 0) {
    return `Calendar has ${total} events, but all are marked as blocks (Airbnb style). For Booking, try Sync again — Booking often uses "CLOSED" for real reservations too.`;
  }

  if (imported === 0 && removed === 0) {
    return `Found ${total} events, but none were recognized as reservations. Check the Export link.`;
  }

  const extra =
    blocked > 0
      ? ` (${blocked} blocks skipped)`
      : total > imported
        ? ` (of ${total} in calendar)`
        : "";

  const removedText =
    removed > 0 ? `, removed ${removed} cancelled` : "";

  if (imported === 0 && removed > 0) {
    return `Removed ${removed} cancelled reservation${removed === 1 ? "" : "s"} that are no longer in the calendar.`;
  }

  return `Imported ${imported} reservation${imported === 1 ? "" : "s"}${extra}${removedText}.`;
}
