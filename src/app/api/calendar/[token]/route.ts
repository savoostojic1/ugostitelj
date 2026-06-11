import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseExportToken } from "@/lib/calendar/export-url";
import { toExportDateOnly } from "@/lib/calendar/export-filter";
import {
  generatePropertyExportIcs,
  type PropertyExportReservation,
} from "@/lib/ical/property-export";

export const runtime = "nodejs";

const EXPORT_VERSION = "3";

interface ExportCalendarPayload {
  property_id: string;
  property_name: string;
  reservations: PropertyExportReservation[];
}

function normalizeReservations(raw: unknown): PropertyExportReservation[] {
  if (!Array.isArray(raw)) return [];

  const rows: PropertyExportReservation[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    if (!r.id || !r.check_in || !r.check_out) continue;

    rows.push({
      id: String(r.id),
      external_uid: String(r.external_uid ?? r.id),
      title: String(r.title ?? "Reserved"),
      check_in: toExportDateOnly(String(r.check_in)),
      check_out: toExportDateOnly(String(r.check_out)),
      platform: String(r.platform ?? "custom"),
        is_manual: Boolean(r.is_manual),
        source: r.source != null ? String(r.source) : null,
        guest_phone: r.guest_phone != null ? String(r.guest_phone) : null,
      });
  }

  return rows.filter((r) => r.is_manual);
}

async function loadExportPayload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  token: string
): Promise<{ payload: ExportCalendarPayload | null; error?: string }> {
  const { data: combined, error: combinedError } = await supabase.rpc(
    "get_property_export_calendar",
    { token }
  );

  if (!combinedError && combined && typeof combined === "object") {
    const payload = combined as Record<string, unknown>;
    if (payload.property_id && payload.property_name) {
      return {
        payload: {
          property_id: String(payload.property_id),
          property_name: String(payload.property_name),
          reservations: normalizeReservations(payload.reservations),
        },
      };
    }
  }

  if (combinedError) {
    console.error("[calendar export] get_property_export_calendar", combinedError);
  }

  const { data: propertyRows, error: propertyError } = await supabase.rpc(
    "get_property_export_by_token",
    { token }
  );

  if (propertyError || !propertyRows?.length) {
    return { payload: null };
  }

  const row = propertyRows[0] as { property_id: string; property_name: string };

  const { data: reservationRows, error: reservationsError } =
    await supabase.rpc("get_property_export_reservations", { token });

  if (reservationsError) {
    console.error("[calendar export] get_property_export_reservations", reservationsError);
    return {
      payload: null,
      error: reservationsError.message,
    };
  }

  return {
    payload: {
      property_id: row.property_id,
      property_name: row.property_name,
      reservations: normalizeReservations(reservationRows),
    },
  };
}

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
  const { payload, error } = await loadExportPayload(supabase, token);

  if (!payload) {
    if (error?.includes("get_property_export")) {
      return new NextResponse(
        "Export is not configured. Run migrations 010, 011 and 012 in the Supabase SQL editor.",
        { status: 503 }
      );
    }
    return new NextResponse("Not found", { status: 404 });
  }

  const ics = generatePropertyExportIcs(
    payload.property_name,
    payload.reservations
  );

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="hostvia-${payload.property_id}.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Hostvia-Export-Version": EXPORT_VERSION,
      "X-Hostvia-Event-Count": String(payload.reservations.length),
    },
  });
}
