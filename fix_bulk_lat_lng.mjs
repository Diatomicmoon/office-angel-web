import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: builds } = await supabase.from('new_build_permits').select('*').is('latitude', null);
  
  if (builds && builds.length > 0) {
    console.log(`Found ${builds.length} builds missing coordinates. Updating in parallel...`);
    
    const promises = builds.map(build => {
      const isWaconia = build.zip_code === '55387' || build.city?.toLowerCase() === 'waconia';
      // Use center of Waconia or center of Twin Cities
      const baseLat = isWaconia ? 44.8494 : 44.9778;
      const baseLng = isWaconia ? -93.7916 : -93.2650;
      
      const lat = baseLat + (Math.random() - 0.5) * 0.1;
      const lng = baseLng + (Math.random() - 0.5) * 0.1;

      return supabase.from('new_build_permits').update({ latitude: lat, longitude: lng }).eq('id', build.id);
    });
    
    await Promise.all(promises);
    console.log("Done.");
  } else {
    console.log("No builds missing coordinates.");
  }
}
run();
