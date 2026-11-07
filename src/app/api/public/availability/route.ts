import { currencyCodeFromUnknown } from "@/lib/currency/currencies";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import {
  jsonWithPublicCors,
  publicApiOptionsResponse,
} from "@/lib/public/public-api-cors";
import { parseStartingPrice } from "@/lib/public/stay-price";
import { createClient } from "@/lib/supabase/server";
import { startOfDay } from "date-fns";

export async function OPTIONS(request: Request) {
  return publicApiOptionsResponse(request);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = Number.parseInt(searchParams.get("guests") ?? "1", 10);

  if (!username || !checkIn || !checkOut) {
    return jsonWithPublicCors(
      request,
      { error: "Missing search parameters" },
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

  if (!Number.isFinite(guests) || guests < 1) {
    return jsonWithPublicCors(
      request,
      { error: "Enter number of guests" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_available_properties", {
      p_username: username,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_guest_count: guests,
    });

    if (error) {
      return jsonWithPublicCors(
        request,
        { error: "Search failed" },
        { status: 500 }
      );
    }

    const properties = (Array.isArray(data) ? data : []).map((property) => ({
      ...property,
      gallery_urls: Array.isArray(property.gallery_urls)
        ? property.gallery_urls.filter(
            (url: unknown): url is string => typeof url === "string"
          )
        : [],
      starting_price: parseStartingPrice(property.starting_price),
      stay_total: parseStartingPrice(property.stay_total),
      currency_code: currencyCodeFromUnknown(property.currency_code),
    }));

    return jsonWithPublicCors(request, { properties });
  } catch (err) {
    console.error("[public/availability]", err);
    return jsonWithPublicCors(
      request,
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
