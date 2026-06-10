import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      propertySlug,
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guestCount,
      message,
    } = body as {
      propertySlug?: string;
      guestName?: string;
      email?: string;
      phone?: string;
      checkIn?: string;
      checkOut?: string;
      guestCount?: number;
      message?: string;
    };

    if (
      !propertySlug?.trim() ||
      !guestName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !checkIn ||
      !checkOut
    ) {
      return NextResponse.json(
        { error: "Popunite sva obavezna polja" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_booking_request", {
      p_property_slug: propertySlug.trim(),
      p_guest_name: guestName.trim(),
      p_email: email.trim(),
      p_phone: phone.trim(),
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_guest_count: guestCount ?? 1,
      p_message: message?.trim() ?? null,
    });

    if (error) {
      const msg = error.message.includes("not available")
        ? "Odabrani datumi nisu dostupni"
        : error.message.includes("not found")
          ? "Smještaj nije pronađen"
          : "Slanje zahtjeva nije uspjelo";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ id: data });
  } catch {
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}
