import { currencyCodeFromUnknown } from "@/lib/currency/currencies";
import { roundMoney } from "@/lib/currency/format";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import {
  jsonWithPublicCors,
  publicApiOptionsResponse,
} from "@/lib/public/public-api-cors";
import { countStayNights, parseStartingPrice } from "@/lib/public/stay-price";
import { createClient } from "@/lib/supabase/server";
import { startOfDay } from "date-fns";

export async function OPTIONS(request: Request) {
  return publicApiOptionsResponse(request);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut) {
    return jsonWithPublicCors(
      request,
      { error: "Stay dates are required" },
      { status: 400 }
    );
  }

  if (checkOut <= checkIn) {
    return jsonWithPublicCors(
      request,
      { error: "Check-out must be after check-in" },
      { status: 400 }
    );
  }

  if (parseDateOnly(checkIn) < startOfDay(new Date())) {
    return jsonWithPublicCors(
      request,
      { error: "Check-in cannot be in the past" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "calculate_public_property_stay_total",
      {
        p_property_id: id,
        p_check_in: checkIn,
        p_check_out: checkOut,
      }
    );

    if (error) {
      return jsonWithPublicCors(
        request,
        { error: "Price not available" },
        { status: 500 }
      );
    }

    const stayTotal = parseStartingPrice(data);
    const nights = countStayNights(checkIn, checkOut);
    let currencyCode = "EUR";
    const { data: currencyData } = await supabase.rpc(
      "get_public_property_currency",
      { p_property_id: id }
    );
    if (typeof currencyData === "string") {
      currencyCode = currencyCodeFromUnknown(currencyData);
    }

    if (stayTotal === null || nights <= 0) {
      return jsonWithPublicCors(request, {
        stay_total: null,
        nights,
        avg_per_night: null,
        currency_code: currencyCode,
      });
    }

    return jsonWithPublicCors(request, {
      stay_total: roundMoney(stayTotal, currencyCode),
      nights,
      avg_per_night: roundMoney(stayTotal / nights, currencyCode),
      currency_code: currencyCode,
    });
  } catch (err) {
    console.error("[public/price]", err);
    return jsonWithPublicCors(
      request,
      { error: "Price not available" },
      { status: 500 }
    );
  }
}
