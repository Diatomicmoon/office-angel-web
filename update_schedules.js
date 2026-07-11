import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('companies').update({ schedule_end_minute: 1260 }).gt('schedule_start_minute', 0);
  console.log("Updated all companies to end at 9 PM (1260 minutes). Error:", error);
}
run();
