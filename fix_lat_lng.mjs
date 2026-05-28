import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: leads } = await supabase.from('leads').select('*').limit(10);
  
  if (leads && leads.length > 0) {
    console.log("Found leads. Injecting fake lat/lng around Eden Prairie (44.8548, -93.4707) and Waconia (44.8494, -93.7916) so they show on map...");
    
    let waconiaLng = -93.7916;
    let epLng = -93.4707;

    for (const lead of leads) {
      // Slight random offset
      const isWaconia = lead.zip_code === '55387' || lead.city?.toLowerCase() === 'waconia';
      const baseLat = isWaconia ? 44.8494 : 44.8548;
      const baseLng = isWaconia ? waconiaLng : epLng;
      
      const lat = baseLat + (Math.random() - 0.5) * 0.02;
      const lng = baseLng + (Math.random() - 0.5) * 0.02;

      await supabase.from('leads').update({ latitude: lat, longitude: lng }).eq('id', lead.id);
    }
    console.log("Done.");
  } else {
    console.log("No leads found.");
  }
}
run();
