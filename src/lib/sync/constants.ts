/** Client-side auto-sync while the dashboard is open (matches server cron). */
export const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
export const LAST_SYNC_STORAGE_KEY = "hostvia-last-sync-at";

export function getLastSyncAt(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(LAST_SYNC_STORAGE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function markSyncCompleted(at = Date.now()) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SYNC_STORAGE_KEY, String(at));
}

export function shouldRunAutoSync(at = Date.now()): boolean {
  return at - getLastSyncAt() >= SYNC_INTERVAL_MS;
}
