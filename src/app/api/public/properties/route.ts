import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseStartingPrice } from "@/lib/public/stay-price";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_host_properties", {
    p_username: username,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load" },
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
    amenities: Array.isArray(property.amenities)
      ? property.amenities.filter(
          (a: unknown): a is string => typeof a === "string"
        )
      : [],
    starting_price: parseStartingPrice(property.starting_price),
  }));

  return NextResponse.json({ properties });
}
