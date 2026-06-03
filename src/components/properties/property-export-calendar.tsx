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
      toast.success("Link kopiran");
    } catch {
      toast.error("Kopiranje nije uspjelo");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Export link (za Airbnb)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Zalijepi ovaj link u Airbnb kao <strong>Import calendar</strong>.
          Ugostitelj će kasnije slati zauzete datume ka Airbnb-u. Za sada je
          kalendar prazan.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            readOnly
            value={exportUrl}
            className="font-mono text-xs"
            aria-label={`Export link za ${propertyName}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={copyUrl}
            aria-label="Kopiraj link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Airbnb: Calendar → Availability → Import calendar → paste URL. Link
          ostaje isti za ovu nekretninu ({propertyName}).
        </p>
      </CardContent>
    </Card>
  );
}
