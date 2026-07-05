import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const body = await req.json().catch(() => ({}));
  
  if (!body.technician_id || typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let company_id = body.company_id;
  if (!company_id) {
    const { data: tech } = await supabase.from('technicians').select('company_id').eq('id', body.technician_id).single();
    if (tech) company_id = tech.company_id;
  }

  const { data, error } = await supabase
    .from("fleet_locations")
    .insert([{
      technician_id: body.technician_id,
      company_id: company_id || '5341bfb2-8fce-4c7a-9a30-20e6aba60a8a', // Fallback
      latitude: body.latitude,
      longitude: body.longitude,
      heading: body.heading || null,
      speed: body.speed || null
    }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
