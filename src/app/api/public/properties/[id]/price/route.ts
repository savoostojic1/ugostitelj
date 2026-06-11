import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import { countStayNights, parseStartingPrice } from "@/lib/public/stay-price";
import { startOfDay } from "date-fns";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Stay dates are required" },
      { status: 400 }
    );
  }

  if (checkOut <= checkIn) {
    return NextResponse.json(
      { error: "Check-out must be after check-in" },
      { status: 400 }
    );
  }

  if (parseDateOnly(checkIn) < startOfDay(new Date())) {
    return NextResponse.json(
      { error: "Check-in cannot be in the past" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("calculate_public_property_stay_total", {
    p_property_id: id,
    p_check_in: checkIn,
    p_check_out: checkOut,
  });

  if (error) {
    return NextResponse.json(
      { error: "Price not available" },
      { status: 500 }
    );
  }

  const stayTotal = parseStartingPrice(data);
  const nights = countStayNights(checkIn, checkOut);

  if (stayTotal === null || nights <= 0) {
    return NextResponse.json({ stay_total: null, nights, avg_per_night: null });
  }

  return NextResponse.json({
    stay_total: stayTotal,
    nights,
    avg_per_night: Math.round((stayTotal / nights) * 100) / 100,
  });
}
