import { currencyCodeFromUnknown } from "@/lib/currency/currencies";
import {
  jsonWithPublicCors,
  publicApiOptionsResponse,
} from "@/lib/public/public-api-cors";
import { parseStartingPrice } from "@/lib/public/stay-price";
import { createClient } from "@/lib/supabase/server";

export async function OPTIONS(request: Request) {
  return publicApiOptionsResponse(request);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return jsonWithPublicCors(
      request,
      { error: "Missing username" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_host_properties", {
      p_username: username,
    });

    if (error) {
      return jsonWithPublicCors(
        request,
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
      currency_code: currencyCodeFromUnknown(property.currency_code),
    }));

    return jsonWithPublicCors(request, { properties });
  } catch (err) {
    console.error("[public/properties]", err);
    return jsonWithPublicCors(
      request,
      { error: "Failed to load" },
      { status: 500 }
    );
  }
}
