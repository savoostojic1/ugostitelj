import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseExportToken } from "@/lib/calendar/export-url";
import {
  generatePropertyExportIcs,
  type PropertyExportReservation,
} from "@/lib/ical/property-export";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token: rawToken } = await context.params;
  const token = parseExportToken(rawToken);

  if (!token) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = await createClient();
  const { data: propertyRows, error: propertyError } = await supabase.rpc(
    "get_property_export_by_token",
    { token }
  );

  if (propertyError || !propertyRows?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const row = propertyRows[0] as { property_id: string; property_name: string };

  const { data: reservationRows, error: reservationsError } =
    await supabase.rpc("get_property_export_reservations", { token });

  if (reservationsError) {
    return new NextResponse("Export unavailable", { status: 500 });
  }

  const reservations = (reservationRows ?? []) as PropertyExportReservation[];
  const ics = generatePropertyExportIcs(row.property_name, reservations);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="ugostitelj-${row.property_id}.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
