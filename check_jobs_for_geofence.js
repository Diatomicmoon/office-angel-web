import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('jobs').select('id, title, address, lat, lng, company_id, geofence_radius_ft').limit(5);
  console.log(JSON.stringify(data, null, 2));
}
run();
