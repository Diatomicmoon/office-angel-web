import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  let company_id;
  try {
    const res = await resolveCompanyIdOrThrow();
    company_id = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  
  if (!body.technician_id || typeof body.lat !== 'number' || typeof body.lng !== 'number') {
    return NextResponse.json({ error: "Missing tech_id, lat, or lng" }, { status: 400 });
  }

  const payload = {
    last_location: { lat: body.lat, lng: body.lng, source: "field_app", accuracy: body.accuracy || null },
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("technicians")
    .update(payload)
    .eq("id", body.technician_id)
    .eq("company_id", company_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ success: true, technician: data });
}
