import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: builds } = await supabase.from('new_build_permits').select('*');
  
  if (builds && builds.length > 0) {
    console.log("Found builds. Injecting fake lat/lng so they show on map...");
    
    for (const build of builds) {
      const isWaconia = build.zip_code === '55387' || build.city?.toLowerCase() === 'waconia';
      const baseLat = isWaconia ? 44.8494 : 44.8548;
      const baseLng = isWaconia ? -93.7916 : -93.4707;
      
      const lat = baseLat + (Math.random() - 0.5) * 0.02;
      const lng = baseLng + (Math.random() - 0.5) * 0.02;

      await supabase.from('new_build_permits').update({ latitude: lat, longitude: lng }).eq('id', build.id);
    }
    console.log("Done.");
  } else {
    console.log("No builds found.");
  }
}
run();
