import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Nedostaje ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "get_public_property_reservations",
    { p_property_id: id }
  );

  if (error) {
    return NextResponse.json(
      { error: "Učitavanje nije uspjelo" },
      { status: 500 }
    );
  }

  const reservations = (Array.isArray(data) ? data : []).map((r) => ({
    check_in: String(r.check_in).split("T")[0],
    check_out: String(r.check_out).split("T")[0],
  }));

  return NextResponse.json({ reservations });
}
