import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // 1. Get Steve's ID (or whoever you are testing as)
  const { data: tech } = await supabase.from('technicians').select('id, name').ilike('name', '%Steve%').single();
  if (!tech) {
    console.log("Could not find tech Steve");
    return;
  }
  
  // 2. Create a test job down the street from where you likely are right now.
  // Using a generic address for demonstration purposes. 
  // We'll update the geofence engine to make sure it's running
  console.log(`Ready to test with tech: ${tech.name} (${tech.id})`);
}
run();
