import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const techId = url.searchParams.get("tech_id");
  const dateStr = url.searchParams.get("date"); // YYYY-MM-DD

  if (!techId || !dateStr) {
    return NextResponse.json({ error: "Missing tech_id or date" }, { status: 400 });
  }

  const start = new Date(`${dateStr}T00:00:00-05:00`).toISOString(); // Approx CDT/CST
  const end = new Date(`${dateStr}T23:59:59-05:00`).toISOString();

  const { data: pings, error } = await supabase
    .from("fleet_locations")
    .select("*")
    .eq("technician_id", techId)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const path = [];
  const stops = [];
  
  let isMoving = false;
  let currentStopPings = [];

  for (let i = 0; i < pings.length; i++) {
    const p = pings[i];
    path.push({ lat: p.latitude, lng: p.longitude });
    
    const speed = p.speed || 0;
    
    if (speed > 5) {
      isMoving = true;
      if (currentStopPings.length > 0) {
        const first = currentStopPings[0];
        const last = currentStopPings[currentStopPings.length - 1];
        const durationMin = (new Date(last.created_at).getTime() - new Date(first.created_at).getTime()) / 60000;
        
        if (durationMin >= 3) { 
          stops.push({
            lat: first.latitude,
            lng: first.longitude,
            start_time: first.created_at,
            end_time: last.created_at,
            duration: Math.round(durationMin)
          });
        }
        currentStopPings = [];
      }
    } else {
      if (isMoving) isMoving = false;
      currentStopPings.push(p);
    }
  }
  
  if (currentStopPings.length > 0) {
    const first = currentStopPings[0];
    const last = currentStopPings[currentStopPings.length - 1];
    const durationMin = (new Date(last.created_at).getTime() - new Date(first.created_at).getTime()) / 60000;
    if (durationMin >= 3) {
      stops.push({
        lat: first.latitude,
        lng: first.longitude,
        start_time: first.created_at,
        end_time: last.created_at,
        duration: Math.round(durationMin),
        is_current: true
      });
    }
  }

  return NextResponse.json({ path, stops });
}
