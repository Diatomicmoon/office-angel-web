import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const customerId = '277aa8d3-9e48-45f7-a9d2-dd793c06aa43';
  const { data, error } = await supabase.from('customers').delete().eq('id', customerId);
  console.log("Deleted test customer. Error:", error);
  
  // also let's just make sure no other test data leaked into this company
  const companyId = '7ec29b70-c591-4d23-94a7-0b2a4a223812';
  
  // Delete any test timesheets or jobs that shouldn't be there
  // Just keeping it clean. He did create a job to test geofencing but he might still want to use it? 
  // Wait, he created a job "Geofence Test" to test the tracking. Let's leave jobs and timesheets alone unless asked.
}
run();
