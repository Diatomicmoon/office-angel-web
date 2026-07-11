import re

with open('src/app/api/technicians/location/route.ts', 'r') as f:
    content = f.read()

# Add Haversine distance function at the top
haversine = """
function getDistanceFt(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 20902231; // Radius of earth in feet
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function POST
"""

content = content.replace("export async function POST", haversine)

# Add Geofence matching logic
geofence_logic = """
  if (error) return NextResponse.json({ error }, { status: 400 });

  // GEOFENCE AUTO-DRAFT LOGIC
  try {
    // 1. Get all jobs with lat/lng for this company
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, address, lat, lng, geofence_radius_ft')
      .eq('company_id', company_id)
      .not('lat', 'is', null)
      .not('lng', 'is', null);
      
    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        const radius = job.geofence_radius_ft || 150;
        const dist = getDistanceFt(body.lat, body.lng, job.lat, job.lng);
        
        if (dist <= radius) {
          // Inside geofence! Check if we already have a draft timesheet for today for this job
          const today = new Date().toISOString().split('T')[0];
          const { data: existing } = await supabase
            .from('timesheets')
            .select('id')
            .eq('technician_id', body.technician_id)
            .like('notes', `%Auto-drafted geofence log for: ${job.title}%`)
            .gte('clock_in', today)
            .limit(1);
            
          if (!existing || existing.length === 0) {
             // Auto-draft a timesheet entry
             await supabase.from('timesheets').insert([{
               company_id: company_id,
               technician_id: body.technician_id,
               clock_in: new Date().toISOString(),
               status: 'pending',
               notes: `📍 Auto-drafted geofence log for: ${job.title} (${job.address})`
             }]);
          }
        }
      }
    }
  } catch(e) {
    console.error("Geofence error:", e);
  }

  return NextResponse.json({ success: true, technician: data });
"""

content = content.replace(
    "if (error) return NextResponse.json({ error }, { status: 400 });\n  return NextResponse.json({ success: true, technician: data });",
    geofence_logic
)

with open('src/app/api/technicians/location/route.ts', 'w') as f:
    f.write(content)
