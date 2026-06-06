import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function geocode(address, city) {
  // Try to get coordinates from OpenStreetMap
  const q = encodeURIComponent(`${address}, ${city}, MN`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'OfficeAngel-Canvass-App/1.0' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error("Geocode fetch error:", e);
  }
  return null;
}

async function run() {
  console.log("Fetching all new build permits to fix their coordinates...");
  const { data: builds } = await supabase.from('new_build_permits').select('*');
  
  if (!builds) return;
  
  let fixedCount = 0;
  let failCount = 0;

  for (const build of builds) {
    // Only attempt if it has an address and city
    if (!build.property_address || !build.city) continue;
    
    // We previously randomized them between 44.9 and 45.0 (Minneapolis) or 44.8... 
    // Let's just re-geocode all of them to be safe.
    
    const coords = await geocode(build.property_address, build.city);
    
    if (coords) {
      await supabase.from('new_build_permits').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', build.id);
      console.log(`[OK] Moved ${build.property_address}, ${build.city} to ${coords.lat}, ${coords.lng}`);
      fixedCount++;
    } else {
      console.log(`[FAIL] Could not find exact map coordinates for: ${build.property_address}, ${build.city}`);
      // If we can't find it, we should probably hide it or put it in the center of the city, but let's leave it for now.
      failCount++;
    }
    
    // OpenStreetMap strictly requires 1 request per second max to avoid being banned
    await new Promise(r => setTimeout(r, 1100));
  }
  
  console.log(`\nGeocoding complete! Fixed ${fixedCount} pins. Failed on ${failCount} obscure addresses.`);
}
run();
