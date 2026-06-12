"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
        <CardTitle className="text-base">Export link (Airbnb & Booking)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            readOnly
            value={exportUrl}
            className="min-w-0 font-mono text-xs"
            aria-label={`Export link for ${propertyName}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={copyUrl}
            aria-label="Copy link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Paste into Airbnb or Booking.com as an import calendar URL — it blocks
          dates from your manual Hostvia reservations on those platforms.
        </p>
      </CardContent>
    </Card>
  );
}
