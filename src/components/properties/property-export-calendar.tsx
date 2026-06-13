"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildPropertyExportUrl } from "@/lib/calendar/export-url";
import { toast } from "sonner";

interface PropertyExportCalendarProps {
  propertyName: string;
  exportToken: string;
}

export function PropertyExportCalendar({
  propertyName,
  exportToken,
}: PropertyExportCalendarProps) {
  const exportUrl = buildPropertyExportUrl(exportToken);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(exportUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <section id="export-calendar" className="hostvia-panel overflow-hidden">
      <div className="hostvia-panel-header">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white">Export calendar</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Paste this link into Airbnb or Booking.com to block dates from
            Hostvia reservations
          </p>
        </div>
      </div>
      <div className="hostvia-panel-body">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            readOnly
            value={exportUrl}
            className="hostvia-input min-w-0 font-mono text-xs"
            aria-label={`Export link for ${propertyName}`}
          />
          <Button
            type="button"
            variant="outline"
            className="hostvia-dashboard-btn shrink-0 gap-2 border-white/10 sm:w-auto"
            onClick={copyUrl}
          >
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
        </div>
      </div>
    </section>
  );
}
