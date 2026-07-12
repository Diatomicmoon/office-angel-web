import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDistanceFromLatLonInFeet(lat1, lon1, lat2, lon2) {
  const R = 20902231; // Radius of the earth in feet
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in feet
}

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'HardHatSolutions/1.0' } });
  const json = await res.json().catch(() => null);
  if (!json || json.length === 0) return null;
  const loc = json[0];
  const lat = Number(loc.lat);
  const lng = Number(loc.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

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
  
  company_id = company_id || '5341bfb2-8fce-4c7a-9a30-20e6aba60a8a';

  // 1. Insert into fleet_locations
  const { error: locError } = await supabase
    .from("fleet_locations")
    .insert([{
      technician_id: body.technician_id,
      company_id: company_id,
      latitude: body.latitude,
      longitude: body.longitude,
      heading: body.heading || null,
      speed: body.speed || null
    }]);

  if (locError) {
    console.error("Fleet Location Error:", locError);
    return NextResponse.json({ error: locError.message }, { status: 400 });
  }

  // --- 2. SMART AUTO-CLOCK LOGIC ---
  
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Fetch today's jobs for this tech
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('technician_id', body.technician_id)
      .gte('scheduled_start', `${todayStr}T00:00:00Z`)
      .lte('scheduled_start', `${todayStr}T23:59:59Z`)
      .in('status', ['scheduled', 'en_route', 'in_progress']);

    // Fetch the currently active timesheet (if any)
    const { data: activeTimesheets } = await supabase
      .from('timesheets')
      .select('*')
      .eq('technician_id', body.technician_id)
      .is('clock_out', null);
      
    const currentTimesheet = activeTimesheets && activeTimesheets.length > 0 ? activeTimesheets[0] : null;

    if (jobs && jobs.length > 0) {
      let closestJob = null;
      let minDistance = Infinity;

      for (const job of jobs) {
        let jLat = job.lat;
        let jLng = job.lng;
        
        // Auto-geocode if missing
        if (!jLat || !jLng) {
           if (job.address) {
             const coords = await geocode(job.address);
             if (coords) {
                jLat = coords.lat;
                jLng = coords.lng;
                await supabase.from('jobs').update({ lat: jLat, lng: jLng }).eq('id', job.id);
             }
           }
        }

        if (jLat && jLng) {
           const dist = getDistanceFromLatLonInFeet(body.latitude, body.longitude, jLat, jLng);
           if (dist < minDistance) {
              minDistance = dist;
              closestJob = job;
           }
        }
      }

      const CLOCK_IN_RADIUS_FT = 500;
      const CLOCK_OUT_RADIUS_FT = 1500; // Require them to leave the 1500 ft area to clock out

      if (closestJob) {
         if (minDistance <= CLOCK_IN_RADIUS_FT) {
            // They are at the house. Check if we need to clock in.
            if (!currentTimesheet) {
               // Auto Clock In
               await supabase.from('timesheets').insert([{
                  company_id: company_id,
                  technician_id: body.technician_id,
                  job_id: closestJob.id,
                  auto_clocked_in: true,
                  geofence_clock_in_lat: body.latitude,
                  geofence_clock_in_lng: body.longitude,
                  clock_in: new Date().toISOString()
               }]);
               await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', closestJob.id);
            } else if (currentTimesheet.job_id !== closestJob.id) {
               // They arrived at a new job, but didn't clock out of the old one.
               // Auto Clock out of the old one first.
               await supabase.from('timesheets').update({
                  clock_out: new Date().toISOString(),
                  auto_clocked_out: true,
                  geofence_clock_out_lat: body.latitude,
                  geofence_clock_out_lng: body.longitude
               }).eq('id', currentTimesheet.id);
               
               // Then clock into new one
               await supabase.from('timesheets').insert([{
                  company_id: company_id,
                  technician_id: body.technician_id,
                  job_id: closestJob.id,
                  auto_clocked_in: true,
                  geofence_clock_in_lat: body.latitude,
                  geofence_clock_in_lng: body.longitude,
                  clock_in: new Date().toISOString()
               }]);
               await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', closestJob.id);
            }
         }
      }

      // Check for auto clock-out
      if (currentTimesheet) {
         // Find the job they are clocked into
         const activeJob = jobs.find(j => j.id === currentTimesheet.job_id);
         if (activeJob && activeJob.lat && activeJob.lng) {
            const dist = getDistanceFromLatLonInFeet(body.latitude, body.longitude, activeJob.lat, activeJob.lng);
            if (dist > CLOCK_OUT_RADIUS_FT) {
               // They have driven away from the active job!
               await supabase.from('timesheets').update({
                  clock_out: new Date().toISOString(),
                  auto_clocked_out: true,
                  geofence_clock_out_lat: body.latitude,
                  geofence_clock_out_lng: body.longitude
               }).eq('id', currentTimesheet.id);
            }
         }
      }
    }
  } catch (err) {
    console.error("Smart Auto-Clock Error:", err);
  }

  return NextResponse.json({ success: true });
}
