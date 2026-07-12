import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  const url = new URL(req.url);
  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  
  let q = supabase
    .from("technicians")
    .select("*, fleet_locations(latitude, longitude, speed, heading, created_at)")
    .order("updated_at", { ascending: false });

  if (companyId) q = q.eq("company_id", companyId);

  const { data, error } = await q;

  // Enhance tech with the most recent fleet location if available
  let enhancedData = data || [];
  if (data && data.length > 0) {
     enhancedData = data.map((t: any) => {
        const fleetData = t.fleet_locations || [];
        if (fleetData.length > 0) {
           // sort by created_at desc
           fleetData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
           const latest = fleetData[0];
           return {
              ...t,
              live_lat: latest.latitude,
              live_lng: latest.longitude,
              live_speed: latest.speed,
              live_heading: latest.heading,
              live_updated_at: latest.created_at,
              fleet_locations: undefined // strip out the array to keep payload small
           };
        }
        return { ...t, fleet_locations: undefined };
     });
  }


  // If the table doesn't exist yet, return an empty list instead of a hard error.
  if (error) return NextResponse.json({ technicians: [], tableAvailable: false });

  return NextResponse.json({ technicians: enhancedData || [], tableAvailable: true });
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  const body = await req.json().catch(() => ({}));

  let company_id;
  try {
    const res = await resolveCompanyIdOrThrow();
    company_id = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: any = {
    company_id,
    name: body.name,
    phone_number: body.phone_number,
    status: body.status,
    current_job_title: body.current_job_title,
    last_location_address: body.last_location_address,
    last_location: body.last_location,
    updated_at: new Date().toISOString(),
  };

  // remove undefined keys
  for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k];

  if (body.id) {
    const { data, error } = await supabase
      .from("technicians")
      .update(payload)
      .eq("id", body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ technician: data });
  }

  const { data, error } = await supabase
    .from("technicians")
    .insert([payload])
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ technician: data });
}
