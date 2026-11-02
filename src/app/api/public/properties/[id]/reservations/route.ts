import {
  jsonWithPublicCors,
  publicApiOptionsResponse,
} from "@/lib/public/public-api-cors";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function OPTIONS(request: Request) {
  return publicApiOptionsResponse(request);
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return jsonWithPublicCors(request, { error: "Missing ID" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "get_public_property_reservations",
      { p_property_id: id }
    );

    if (error) {
      return jsonWithPublicCors(
        request,
        { error: "Failed to load" },
        { status: 500 }
      );
    }

    const reservations = (Array.isArray(data) ? data : []).map((r) => ({
      check_in: String(r.check_in).split("T")[0],
      check_out: String(r.check_out).split("T")[0],
    }));

    return jsonWithPublicCors(request, { reservations });
  } catch (err) {
    console.error("[public/reservations]", err);
    return jsonWithPublicCors(
      request,
      { error: "Failed to load" },
      { status: 500 }
    );
  }
}
