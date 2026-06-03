import { formatSyncResultMessage } from "@/lib/ical/sync-message";

export interface SyncFeedResult {
  feedId?: string;
  imported?: number;
  totalEvents?: number;
  skippedBlocked?: number;
  skippedInvalid?: number;
  error?: string;
}

export async function postSyncAll(): Promise<{
  results: SyncFeedResult[];
  error?: string;
}> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ syncAll: true }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "Sync failed");
  }
  return json as { results: SyncFeedResult[] };
}

export function aggregateSyncResults(results: SyncFeedResult[]) {
  type Totals = {
    imported: number;
    totalEvents: number;
    skippedBlocked: number;
    skippedInvalid: number;
  };

  return results.reduce<Totals>(
    (acc, r) => ({
      imported: acc.imported + (r.imported ?? 0),
      totalEvents: acc.totalEvents + (r.totalEvents ?? 0),
      skippedBlocked: acc.skippedBlocked + (r.skippedBlocked ?? 0),
      skippedInvalid: acc.skippedInvalid + (r.skippedInvalid ?? 0),
    }),
    { imported: 0, totalEvents: 0, skippedBlocked: 0, skippedInvalid: 0 }
  );
}

export function formatSyncAllResultMessage(results: SyncFeedResult[]): string {
  if (results.length === 0) {
    return "Nema povezanih kalendara za sync.";
  }

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return failed.error;
  }

  return formatSyncResultMessage(aggregateSyncResults(results));
}
