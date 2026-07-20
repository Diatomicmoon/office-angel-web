import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDistanceFromLatLonInFeet(lat1: number, lon1: number, lat2: number, lon2: number) {
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

async function reverseGeocode(lat: number, lng: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'HardHatSolutions/1.0' } });
    const json = await res.json().catch(() => null);
    if (!json || json.error) return null;
    
    // Make it a shorter, nicer address (e.g. street + city)
    let nice = json.display_name;
    if (json.address) {
       const street = json.address.road || json.address.pedestrian || "";
       const houseNumber = json.address.house_number || "";
       const city = json.address.city || json.address.town || json.address.village || json.address.municipality || "";
       if (street && city) {
          nice = houseNumber ? `${houseNumber} ${street}, ${city}` : `${street}, ${city}`;
       }
    }
    return nice;
  } catch(e) {
    return null;
  }
}

async function geocode(address: string) {
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

  // Update the technicians table so the dashboard sees it live
  try {
     let addressUpdate: any = { updated_at: new Date().toISOString() };
     
     // Update status to en_route if speed > 10 mph (roughly)
     if (body.speed && body.speed > 10) {
        addressUpdate.status = 'en_route';
     }

     const address = await reverseGeocode(body.latitude, body.longitude);
     if (address) {
       addressUpdate.last_location_address = address;
     }

     await supabase.from('technicians').update(addressUpdate).eq('id', body.technician_id);
  } catch (err) {
     console.error("Address update error:", err);
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
