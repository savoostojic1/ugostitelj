import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import { parseStartingPrice } from "@/lib/public/stay-price";
import { startOfDay } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = Number.parseInt(searchParams.get("guests") ?? "1", 10);

  if (!username || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Nedostaju parametri pretrage" },
      { status: 400 }
    );
  }

  if (checkOut <= checkIn) {
    return NextResponse.json(
      { error: "Datum odlaska mora biti poslije dolaska" },
      { status: 400 }
    );
  }

  if (parseDateOnly(checkIn) < startOfDay(new Date())) {
    return NextResponse.json(
      { error: "Dolazak ne može biti u prošlosti" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(guests) || guests < 1) {
    return NextResponse.json(
      { error: "Unesite broj gostiju" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_available_properties", {
    p_username: username,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_guest_count: guests,
  });

  if (error) {
    return NextResponse.json(
      { error: "Pretraga nije uspjela" },
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
  }));

  return NextResponse.json({ properties });
}
